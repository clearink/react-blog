import React, { isValidElement, memo, useMemo } from "react"
import Form, { FormInstance, FormProps } from "antd/lib/form"
import FormMap from "@/configs/FormMap"
import { message } from "antd"
interface IProps<T> extends FormProps {
	config?: { [key: string]: any }
	form: FormInstance<T>
}

// 由配置生成form的组件
// 传入配置属性 与 formInstance
function RenderForm<T>(props: IProps<T>) {
	const { config, form, children, ...rest } = props
	const renderItemList = useMemo(() => {
		if (!config) return null
		return Object.entries(config).map(([key, { name, type, value }]) => {
			const FormComponent = FormMap[type]
			if (!FormComponent || !isValidElement(<FormComponent />)) return null
			return (
				<Form.Item
					rules={[{ required: true, message: `${name}必填` }]}
					key={key}
					name={key}
					label={name}
				>
					<FormComponent config={value} name={name} placeholder={name} />
				</Form.Item>
			)
		})
	}, [config])
	return (
		<Form form={form} scrollToFirstError {...rest}>
			{renderItemList}
			{children}
		</Form>
	)
}

export default memo(RenderForm)