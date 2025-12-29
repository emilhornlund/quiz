import type { FC } from 'react'
import { useMemo } from 'react'

import { DeviceType } from '../../utils/device-size.types.ts'
import { classNames } from '../../utils/helpers.ts'
import { useDeviceSizeType } from '../../utils/useDeviceSizeType'

import styles from './SegmentedControl.module.scss'

export interface SegmentedControlProps {
  id: string
  kind?: 'primary' | 'secondary'
  size?: 'normal' | 'small'
  value?: string | undefined
  values?: { key: string; value: string; valueLabel: string }[]
  onChange?: (value: string) => void
}

const SegmentedControl: FC<SegmentedControlProps> = ({
  id,
  kind = 'primary',
  size = 'normal',
  value,
  values,
  onChange,
}) => {
  const deviceType = useDeviceSizeType()

  const deviceSize = useMemo(
    () => (deviceType === DeviceType.Mobile ? 'small' : size),
    [size, deviceType],
  )

  return (
    <div className={styles.segmentedControl}>
      {values?.map((item, index) => (
        <div
          key={item.key}
          className={classNames(
            styles.segmentedControlItem,
            kind === 'primary'
              ? styles.segmentedControlInputKindPrimary
              : undefined,
            kind === 'secondary'
              ? styles.segmentedControlInputKindSecondary
              : undefined,
            deviceSize === 'small'
              ? styles.segmentedControlInputSizeSmall
              : styles.segmentedControlInputSizeNormal,
            (value ? value === item.value : index === 0)
              ? styles.segmentedControlInputActive
              : styles.segmentedControlInputInactive,
          )}>
          <button
            id={`${id}_${item.value}`}
            name={`${id}_${item.value}`}
            type="button"
            data-testid={`test-${id}_${item.value}-segmented-control`}
            onClick={() => onChange?.(item.value)}>
            {item.valueLabel}
          </button>
        </div>
      ))}
    </div>
  )
}

export default SegmentedControl
