import { type ChangeEvent, type FC, useId } from 'react'

import styles from './Switch.module.scss'

export type SwitchProps = {
  id?: string
  label?: string
  value?: boolean
  onChange?: (value: boolean) => void
}

const Switch: FC<SwitchProps> = ({ id, label, value = false, onChange }) => {
  const generatedId = useId()
  const switchId = id ?? generatedId

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked)
  }

  return (
    <label className={styles.switchContainer}>
      {label && (
        <span className={styles.labelText} title={label}>
          {label}
        </span>
      )}

      <span className={styles.switch}>
        <input
          type="checkbox"
          id={switchId}
          role="switch"
          checked={value}
          onChange={handleChange}
        />
        <span className={styles.slider} />
      </span>
    </label>
  )
}

export default Switch
