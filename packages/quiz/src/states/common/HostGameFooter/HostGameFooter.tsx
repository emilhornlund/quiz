import {
  faCircleQuestion,
  faGear,
  faLockOpen,
  faMaximize,
  faMinimize,
  faRightFromBracket,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { type FC, useRef, useState } from 'react'

import {
  Button,
  ConfirmDialog,
  Menu,
  MenuItem,
  MenuSeparator,
} from '../../../components'
import { useGameContext } from '../../../context/game'

import styles from './HostGameFooter.module.scss'

export interface HostGameFooterProps {
  gamePIN: string
  currentQuestion: number
  totalQuestions: number
}

const HostGameFooter: FC<HostGameFooterProps> = ({
  gamePIN,
  currentQuestion,
  totalQuestions,
}) => {
  const { isFullscreenActive, toggleFullscreen, quitGame } = useGameContext()

  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false)
  const settingsMenuButtonRef = useRef<HTMLDivElement>(null)
  const toggleSettingsMenu = () => setSettingsMenuOpen((prev) => !prev)

  const [showConfirmQuitGameDialog, setShowConfirmQuitGameDialog] =
    useState<boolean>(false)

  return (
    <div className={styles.main}>
      <div className={styles.questions}>
        <FontAwesomeIcon icon={faCircleQuestion} />
        <span>
          {currentQuestion} / {totalQuestions}
        </span>
      </div>
      <div className={styles.gamePIN}>
        <FontAwesomeIcon icon={faLockOpen} />
        <span>{gamePIN}</span>
      </div>
      <div className={styles.actions}>
        <div className={styles.menuButtonWrapper} ref={settingsMenuButtonRef}>
          <Button
            id="settings-button"
            type="button"
            kind="plain"
            icon={faGear}
            onClick={toggleSettingsMenu}
          />
          <Menu
            anchorRef={settingsMenuButtonRef}
            position="above"
            align="end"
            isOpen={settingsMenuOpen}
            onClose={toggleSettingsMenu}>
            <MenuItem icon={faUsers} onClick={() => undefined} disabled>
              Players
            </MenuItem>
            <MenuItem
              icon={isFullscreenActive ? faMinimize : faMaximize}
              onClick={toggleFullscreen}>
              {isFullscreenActive ? 'Minimize' : 'Maximize'}
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              icon={faRightFromBracket}
              onClick={() => setShowConfirmQuitGameDialog(true)}>
              Quit
            </MenuItem>
          </Menu>
        </div>
      </div>
      <ConfirmDialog
        title="Are you sure you want to quit the game?"
        message="This will immediately end the game for all participants, and it cannot be resumed."
        open={showConfirmQuitGameDialog}
        confirmTitle="Quit Game"
        onConfirm={() => {
          quitGame?.()
          setShowConfirmQuitGameDialog(false)
        }}
        onClose={() => setShowConfirmQuitGameDialog(false)}
        destructive
      />
    </div>
  )
}

export default HostGameFooter
