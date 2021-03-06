import { useCallback, useRef } from "react"

interface IRef {
	fn: Function
	timer: number | undefined
	first: boolean
}
// 函数防抖
type F = (...args: any[]) => any
export default function useDebounce<T extends F>(
	fn: T,
	delay: number,
	immediate: boolean = false
) {
	const memoried = useRef<IRef>({
		fn,
		timer: undefined,
		first: true,
	})

	return useCallback(
		function (this: void, ...args) {
			const { current } = memoried
			clearTimeout(current.timer)

			if (immediate && current.first) {
				current.first = false
				current.fn.apply(this, args)
			} else {
				// 设置定时器
				current.timer = window.setTimeout(() => {
					current.timer = undefined
					current.fn.apply(this, args)
				}, delay)
			}
		},
		[delay, immediate]
	)
}
