import React, {
	cloneElement,
	forwardRef,
	isValidElement,
	memo,
	ReactNode,
	Ref,
	useImperativeHandle,
	useMemo,
} from "react"
import { Modal } from "antd"
import { ModalProps } from "antd/lib/modal"
import useBoolean from "@/hooks/useBoolean"
// antd 模态框封装
interface IProps extends Omit<ModalProps, "visible"> {
	trigger?: ReactNode
	children?: ReactNode
}
export interface IModalTriggerRef {
	toggle: () => void
	//((instance: T | null) => void) | MutableRefObject<T | null> | null)
}
function ModalTrigger(props: IProps, ref: Ref<IModalTriggerRef>) {
	const { trigger, children, ...rest } = props
	const [visible, toggle] = useBoolean(false)

	useImperativeHandle(ref, () => ({ toggle }), [toggle])

	const wrappedTrigger = useMemo(() => {
		if (!trigger || !isValidElement(trigger)) return trigger
		return cloneElement(trigger, {
			onClick: (e: MouseEvent) => {
				const { onClick } = trigger.props
				onClick ? onClick(e, toggle) : toggle()
			},
		})
	}, [trigger, toggle])
	return (
		<>
			{wrappedTrigger}
			<Modal visible={visible} onCancel={toggle as any} {...rest}>
				{children}
			</Modal>
		</>
	)
}

export default memo(forwardRef(ModalTrigger))
