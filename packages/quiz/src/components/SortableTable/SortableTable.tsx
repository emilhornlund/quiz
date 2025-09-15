import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faGrip } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC, useEffect, useRef, useState } from 'react'

import colors from '../../styles/colors.module.scss'
import { classNames } from '../../utils/helpers.ts'

import styles from './SortableTable.module.scss'

export type SortableTableValue = {
  id: string
  value: string
  icon?: IconDefinition
  iconColor?: string
}

export type SortableTableProps = {
  values?: SortableTableValue[]
  disabled?: boolean
  onChange?: (values: SortableTableValue[]) => void
}

type SortableItemProps = {
  id: string
  disabled?: boolean
} & Pick<SortableTableValue, 'value' | 'icon' | 'iconColor'>

const SortableItem: FC<SortableItemProps> = ({
  id,
  disabled,
  value,
  icon,
  iconColor = colors.gray4,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      className={classNames(
        styles.item,
        !disabled ? styles.draggable : undefined,
      )}
      style={style}
      {...attributes}
      {...listeners}>
      <div className={styles.value}>{value}</div>

      {!disabled && !icon && (
        <FontAwesomeIcon
          icon={faGrip}
          color={iconColor}
          className={styles.icon}
        />
      )}
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          color={iconColor}
          className={styles.icon}
        />
      )}
    </div>
  )
}

const SortableTable: FC<SortableTableProps> = ({
  values = [],
  disabled = false,
  onChange = () => undefined,
}) => {
  const [internalValues, setInternalValues] = useState(values)
  useEffect(() => {
    setInternalValues(values)
  }, [values])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 5 },
    }),
  )

  const lastOrderRef = useRef<string>('')
  useEffect(() => {
    const tmpLastOrderRef = internalValues.map(({ id }) => id).join(',')
    if (lastOrderRef.current !== tmpLastOrderRef) {
      lastOrderRef.current = tmpLastOrderRef
      onChange(internalValues)
    }
  }, [internalValues, onChange])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active?.id !== over?.id) {
      setInternalValues((items) => {
        const oldIndex = items.findIndex(({ id }) => id === active.id)
        const newIndex = items.findIndex(({ id }) => id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className={styles.sortableTable}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}>
        <SortableContext
          items={internalValues}
          strategy={verticalListSortingStrategy}>
          {internalValues.map((value) => (
            <SortableItem {...value} disabled={disabled} key={value.id} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default SortableTable
