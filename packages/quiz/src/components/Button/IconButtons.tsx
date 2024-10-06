import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import React, { FC } from 'react'

import Button, { ButtonProps } from './Button'

type IconButtonProps = Omit<ButtonProps, 'icon' | 'iconPosition'>

export const IconButtonArrowLeft: FC<IconButtonProps> = (props) => (
  <Button {...props} icon={faArrowLeft} iconPosition="leading" />
)

export const IconButtonArrowRight: FC<IconButtonProps> = (props) => (
  <Button {...props} icon={faArrowRight} iconPosition="trailing" />
)
