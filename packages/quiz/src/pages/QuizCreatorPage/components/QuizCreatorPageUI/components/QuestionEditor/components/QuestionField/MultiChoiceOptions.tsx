import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  defaultAnimateLayoutChanges,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { faGrip } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  QuestionMultiChoiceOptionDto,
  QUIZ_MULTI_CHOICE_OPTION_VALUE_REGEX,
  QUIZ_MULTI_CHOICE_OPTIONS_MAX,
  QUIZ_MULTI_CHOICE_OPTIONS_MIN,
} from '@quiz/common'
import React, {
  FC,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { TextField } from '../../../../../../../../components'
import { classNames } from '../../../../../../../../utils/helpers.ts'

import styles from './QuestionField.module.scss'

export interface MultiChoiceOptionsProps {
  values?: QuestionMultiChoiceOptionDto[]
  onChange: (value: QuestionMultiChoiceOptionDto[]) => void
  onValid: (valid: boolean) => void
}

type MultiChoiceSortableOptionValue = QuestionMultiChoiceOptionDto & {
  id: string
}

type MultiChoiceSortableOptionProps = MultiChoiceSortableOptionValue & {
  placeholder: string
  required: boolean
  showErrorMessage: boolean
  onChange: (value: string) => void
  onCheck: (checked: boolean) => void
  onValid: (valid: boolean) => void
  onAdditionalValidation: () => boolean | string
}

const MultiChoiceSortableOption: FC<MultiChoiceSortableOptionProps> = ({
  id,
  placeholder,
  value,
  correct,
  required,
  showErrorMessage,
  onChange,
  onCheck,
  onValid,
  onAdditionalValidation,
}) => {
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges: (args) =>
      args.isSorting || args.wasDragging
        ? false
        : defaultAnimateLayoutChanges(args),
  })

  const [dragDims, setDragDims] = useState<{ w: number; h: number } | null>(
    null,
  )

  const nodeEl = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isDragging && nodeEl.current) {
      const r = nodeEl.current.getBoundingClientRect()
      setDragDims((prev) =>
        r.width && r.height ? { w: r.width, h: r.height } : (prev ?? null),
      )
    }
    if (!isDragging) setDragDims(null)
  }, [isDragging])

  const setBothRefs = useCallback(
    (el: HTMLDivElement | null) => {
      nodeEl.current = el
      setNodeRef(el)
    },
    [setNodeRef],
  )

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    width: isDragging && dragDims ? `${dragDims.w}px` : undefined,
    height: isDragging && dragDims ? `${dragDims.h}px` : undefined,
  }

  return (
    <div
      ref={setBothRefs}
      style={style}
      className={classNames(
        styles.option,
        isDragging ? styles.dragging : undefined,
      )}>
      <div className={styles.content}>
        <TextField
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          checked={correct}
          regex={QUIZ_MULTI_CHOICE_OPTION_VALUE_REGEX}
          onChange={(newValue) => onChange(newValue as string)}
          onCheck={onCheck}
          onValid={onValid}
          onAdditionalValidation={onAdditionalValidation}
          required={required}
          forceValidate
          showErrorMessage={showErrorMessage}
        />
      </div>
      <div
        className={classNames(
          styles.handle,
          isDragging ? styles.dragging : undefined,
        )}
        {...attributes}
        {...listeners}
        ref={setActivatorNodeRef}>
        <FontAwesomeIcon icon={faGrip} className={styles.icon} />
      </div>
    </div>
  )
}

const MultiChoiceOptions: FC<MultiChoiceOptionsProps> = ({
  values,
  onChange,
  onValid,
}) => {
  const prefix = useId().replace(/:/g, '')

  const [options, setOptions] = useState<MultiChoiceSortableOptionValue[]>(() =>
    Array.from({ length: QUIZ_MULTI_CHOICE_OPTIONS_MAX }, (_, index) => ({
      id: `multi-choice-option-${prefix}-${index}`,
      value: values?.[index]?.value || '',
      correct: !!values?.[index]?.correct,
    })),
  )

  useEffect(() => {
    setOptions((prev) =>
      prev.map((opt, i) => ({
        ...opt,
        // keep the existing stable id
        value: values?.[i]?.value ?? '',
        correct: !!values?.[i]?.correct,
      })),
    )
  }, [values])

  const isRequired = useCallback(
    (index: number): boolean => {
      const lastFilled = [...options]
        .reverse()
        .findIndex((o) => (o.value?.length ?? 0) > 0 || o.correct)
      const cutoff =
        lastFilled >= 0
          ? Math.max(options.length - lastFilled, QUIZ_MULTI_CHOICE_OPTIONS_MIN)
          : QUIZ_MULTI_CHOICE_OPTIONS_MIN
      return index < cutoff
    },
    [options],
  )

  const handleAdditionalValidation = useCallback(
    (index: number): boolean | string => {
      const someCorrect = options.some((o) => o.correct)
      if (isRequired(index) && !someCorrect) {
        return 'At least one option must be marked correct'
      }
      return true
    },
    [options, isRequired],
  )

  const handleChange = useCallback(
    (updatedIndex: number, newValue?: string, newCorrect?: boolean) => {
      setOptions((prev) => {
        const next = [...prev]
        if (newValue !== undefined) {
          next[updatedIndex] = { ...next[updatedIndex], value: newValue }
        }
        if (newCorrect !== undefined) {
          next[updatedIndex] = { ...next[updatedIndex], correct: newCorrect }
        }

        // Trim trailing empty/unchecked when emitting, but keep local list intact
        const lastFilled = [...next]
          .reverse()
          .findIndex((o) => (o.value?.length ?? 0) > 0 || o.correct)
        const cutoff =
          lastFilled >= 0
            ? Math.max(next.length - lastFilled, QUIZ_MULTI_CHOICE_OPTIONS_MIN)
            : QUIZ_MULTI_CHOICE_OPTIONS_MIN

        onChange(
          next
            .slice(0, cutoff)
            .map(({ value, correct }) => ({ value, correct })),
        )

        return next
      })
    },
    [onChange],
  )

  const [validById, setValidById] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const allowed = new Set(options.map((o) => o.id))
    setValidById((prev) => {
      let changed = false
      const next: Record<string, boolean> = {}
      for (const id of Object.keys(prev)) {
        if (allowed.has(id)) next[id] = prev[id]
        else changed = true
      }
      return changed ? next : prev
    })
  }, [options])

  const handleValidChange = useCallback((id: string, valid: boolean) => {
    setValidById((prev) =>
      prev[id] === valid ? prev : { ...prev, [id]: valid },
    )
  }, [])

  const isAllValid = options.every((o) => validById[o.id])
  const wasAllValid = useRef<boolean | undefined>(undefined)

  useEffect(() => {
    if (wasAllValid.current !== isAllValid) {
      wasAllValid.current = isAllValid
      onValid(isAllValid)
    }
  }, [isAllValid, onValid])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 2 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 160, tolerance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const [isDragging, setDragging] = useState(false)

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = options.findIndex((o) => o.id === active.id)
      const newIndex = options.findIndex((o) => o.id === over.id)
      if (oldIndex < 0 || newIndex < 0) return

      setOptions((prev) => {
        const next = arrayMove(prev, oldIndex, newIndex)

        const lastFilled = [...next]
          .reverse()
          .findIndex((o) => (o.value?.length ?? 0) > 0 || o.correct)
        const cutoff =
          lastFilled >= 0
            ? Math.max(next.length - lastFilled, QUIZ_MULTI_CHOICE_OPTIONS_MIN)
            : QUIZ_MULTI_CHOICE_OPTIONS_MIN

        onChange(
          next
            .slice(0, cutoff)
            .map(({ value, correct }) => ({ value, correct })),
        )

        return next
      })
    },
    [options, onChange],
  )

  const activeIdRef = useRef<string | null>(null)

  return (
    <div className={styles.optionsContainer}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => {
          setDragging(true)
          activeIdRef.current = String(active.id)
        }}
        onDragCancel={() => setDragging(false)}
        onDragEnd={(e) => {
          handleDragEnd(e)
          setDragging(false)
          if (activeIdRef.current) {
            requestAnimationFrame(() => {
              const el = document.getElementById(activeIdRef.current!)
              el?.focus?.()
            })
            activeIdRef.current = null
          }
        }}>
        <SortableContext
          items={options.map((o) => o.id)}
          strategy={rectSortingStrategy}>
          {options.map((option, index) => (
            <MultiChoiceSortableOption
              key={option.id}
              placeholder={`Option ${index + 1}`}
              showErrorMessage={!isDragging}
              onChange={(newValue) =>
                handleChange(index, newValue as string, undefined)
              }
              onCheck={(newChecked) =>
                handleChange(index, undefined, newChecked)
              }
              onValid={(v) => handleValidChange(option.id, v)}
              onAdditionalValidation={() => handleAdditionalValidation(index)}
              required={isRequired(index)}
              {...option}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default MultiChoiceOptions
