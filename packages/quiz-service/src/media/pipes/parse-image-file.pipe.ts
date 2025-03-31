import * as fs from 'fs'
import { rm, unlink } from 'node:fs/promises'
import { join } from 'path'

import {
  Inject,
  Injectable,
  Logger,
  PipeTransform,
  Scope,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { REQUEST } from '@nestjs/core'
import {
  UPLOAD_IMAGE_MAX_FILE_SIZE,
  UPLOAD_IMAGE_MIMETYPE_REGEX,
  UPLOAD_IMAGE_MIN_FILE_SIZE,
} from '@quiz/common'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

import { EnvironmentVariables } from '../../app/config'
import { Client } from '../../client/services/models/schemas'

interface ClientRequest extends Request {
  client?: Client
}

/**
 * Pipe that validates, processes, and converts uploaded image files.
 *
 * It resizes the image based on orientation and converts it to WebP format.
 * The original file is removed after processing.
 */
@Injectable({ scope: Scope.REQUEST })
export class ParseImageFilePipe
  implements PipeTransform<Express.Multer.File, Promise<string>>
{
  /**
   * Creates a new instance of ParseImageFilePipe.
   *
   * @param request - description here.
   * @param configService - Service to access environment variables.
   * @param logger - Optional logger for error tracking.
   */
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly logger: Logger = new Logger(ParseImageFilePipe.name),
  ) {}

  /**
   * Transforms and processes the uploaded file.
   *
   * @param file - The uploaded file to validate and convert.
   *
   * @returns The filename of the newly processed image.
   */
  async transform(file: Express.Multer.File): Promise<string> {
    const outputDirectory = this.configService.get<string>('UPLOAD_DIRECTORY')

    const originalFilePath = join(outputDirectory, file.filename)

    const client = (this.request as ClientRequest).client

    if (!client) {
      throw new UnauthorizedException('Unauthorized')
    }

    let isNewDirectory = false
    const newOutputDirectory = join(outputDirectory, client._id)
    if (!fs.existsSync(newOutputDirectory)) {
      fs.mkdirSync(newOutputDirectory)
      isNewDirectory = true
    }

    const newFileName = `${client._id}/${uuidv4()}.webp`
    const newFilePath = join(outputDirectory, newFileName)

    try {
      this.validate(file)
      await this.resizeImage(originalFilePath, newFilePath)
    } catch (error) {
      if (isNewDirectory) {
        await rm(newOutputDirectory, { recursive: true, force: true })
      }
      const { message, stack } = error as Error
      this.logger.error(`Unable to process image file: ${message}`, stack)
      throw new UnprocessableEntityException('Unable to process image file')
    } finally {
      await unlink(originalFilePath)
    }

    return newFileName
  }

  /**
   * Validates the uploaded file's mimetype and size.
   *
   * @param file - The file to validate.
   *
   * @private
   */
  private validate(file: Express.Multer.File): void {
    if (
      !('mimetype' in file) ||
      !file.mimetype.match(UPLOAD_IMAGE_MIMETYPE_REGEX)
    ) {
      this.logger.warn(`Invalid file type: ${file.mimetype}`)
      throw new UnprocessableEntityException('Unable to process image file')
    }

    if (
      !('size' in file) ||
      file.size < UPLOAD_IMAGE_MIN_FILE_SIZE ||
      file.size > UPLOAD_IMAGE_MAX_FILE_SIZE
    ) {
      this.logger.warn(`Invalid file size: ${file.size}`)
      throw new UnprocessableEntityException('Unable to process image file')
    }
  }

  /**
   * Resizes the image and converts it to WebP format.
   *
   * @param inputFilePath - Path to the uploaded image.
   * @param outputFilePath - Path to save the processed image.
   *
   * @private
   */
  private async resizeImage(
    inputFilePath: string,
    outputFilePath: string,
  ): Promise<void> {
    const image = sharp(inputFilePath)

    const metadata = await image.metadata()

    await image
      .resize({
        width: metadata.width > metadata.height ? 800 : null,
        height: metadata.height > metadata.width ? 800 : null,
        withoutEnlargement: true,
      })
      .webp({ quality: 75 })
      .toFile(outputFilePath)
  }
}
