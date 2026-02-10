import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  updateGameSettings: vi.fn().mockResolvedValue({}),
}))

vi.mock('../../../../context/game', () => ({
  useGameContext: () => ({
    updateGameSettings: h.updateGameSettings,
  }),
}))

import GameSettingsModal from './GameSettingsModal'

describe('GameSettingsModal', () => {
  beforeEach(() => {
    h.updateGameSettings.mockClear()
  })

  it('renders with initial settings', () => {
    render(
      <GameSettingsModal
        randomizeQuestionOrder={true}
        randomizeAnswerOrder={false}
        open={true}
      />,
    )

    const questionOrderSwitch = screen.getByRole('switch', {
      name: /randomize order of questions/i,
    })
    const answerOrderSwitch = screen.getByRole('switch', {
      name: /randomize order of answers/i,
    })

    expect(questionOrderSwitch).toBeChecked()
    expect(answerOrderSwitch).not.toBeChecked()
  })

  it('calls updateGameSettings when toggling question order', async () => {
    const user = userEvent.setup()

    render(
      <GameSettingsModal
        randomizeQuestionOrder={false}
        randomizeAnswerOrder={false}
        open={true}
      />,
    )

    const questionOrderSwitch = screen.getByRole('switch', {
      name: /randomize order of questions/i,
    })

    await user.click(questionOrderSwitch)

    expect(h.updateGameSettings).toHaveBeenCalledTimes(1)
    expect(h.updateGameSettings).toHaveBeenCalledWith({
      randomizeQuestionOrder: true,
      randomizeAnswerOrder: false,
    })
  })

  it('calls updateGameSettings when toggling answer order', async () => {
    const user = userEvent.setup()

    render(
      <GameSettingsModal
        randomizeQuestionOrder={false}
        randomizeAnswerOrder={false}
        open={true}
      />,
    )

    const answerOrderSwitch = screen.getByRole('switch', {
      name: /randomize order of answers/i,
    })

    await user.click(answerOrderSwitch)

    expect(h.updateGameSettings).toHaveBeenCalledTimes(1)
    expect(h.updateGameSettings).toHaveBeenCalledWith({
      randomizeQuestionOrder: false,
      randomizeAnswerOrder: true,
    })
  })

  it('resets local state when modal is reopened', async () => {
    const user = userEvent.setup()

    const { rerender } = render(
      <GameSettingsModal
        randomizeQuestionOrder={false}
        randomizeAnswerOrder={false}
        open={true}
      />,
    )

    const questionOrderSwitch = screen.getByRole('switch', {
      name: /randomize order of questions/i,
    })

    await user.click(questionOrderSwitch)

    expect(questionOrderSwitch).toBeChecked()

    rerender(
      <GameSettingsModal
        randomizeQuestionOrder={false}
        randomizeAnswerOrder={false}
        open={false}
      />,
    )

    rerender(
      <GameSettingsModal
        randomizeQuestionOrder={false}
        randomizeAnswerOrder={false}
        open={true}
      />,
    )

    const questionOrderSwitchReopened = screen.getByRole('switch', {
      name: /randomize order of questions/i,
    })

    expect(questionOrderSwitchReopened).not.toBeChecked()
  })
})
