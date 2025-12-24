import { GameMode } from '@quiz/common'
import type { FC } from 'react'

import { Modal } from '../../../../../../components'

import styles from './GameModeSelectionModal.module.scss'

export interface GameModeSelectionModalProps {
  onSelect?: (gameMode: GameMode) => void
}

const GameModeSelectionModal: FC<GameModeSelectionModalProps> = ({
  onSelect,
}) => {
  return (
    <Modal title="Choose Your Game Mode" open>
      Choose the game mode for your quiz. Each mode offers a unique way for
      participants to play and enjoy!
      <div className={styles.gameModeSelectionModalWrapper}>
        <button
          className={styles.classic}
          onClick={() => onSelect?.(GameMode.Classic)}>
          Classic Mode
          <div className={styles.description}>
            Create a traditional quiz with a mix of question types, including
            multiple-choice, true/false, range sliders, and typed answers.
          </div>
        </button>
        <button
          className={styles.zeroToOneHundred}
          onClick={() => onSelect?.(GameMode.ZeroToOneHundred)}>
          0-100 Mode
          <div className={styles.description}>
            Design a quiz with slider-based questions, where all answers range
            between 0 and 100.
          </div>
        </button>
      </div>
    </Modal>
  )
}

export default GameModeSelectionModal
