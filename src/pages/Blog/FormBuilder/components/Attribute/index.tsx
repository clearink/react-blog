import React, { useEffect, useMemo } from "react"
import { Button, Result } from "antd"
import classNames from "classnames"
import styles from "./style.module.scss"
import useBoolean from "@/hooks/useBoolean"
import { DoubleLeftOutlined, DoubleRightOutlined } from "@ant-design/icons"
import { Form, Typography } from "antd"
import FormMap from "@/configs/FormMap"
import { selectors, actions } from "@/store/reducers/builder"
import useCacheSelector from "@/hooks/useCacheSelector"
import GetBoundAction from "@/utils/GetBoundAction"

const boundActions = GetBoundAction(actions)
interface IProps {}
function Attribute(props: IProps) {
	// TODO 自动根据是否选择打开
	const [collapsed, toggle] = useBoolean()
	const formMeta = useCacheSelector(selectors.selectConfig)

	const [form] = Form.useForm()
	const FormItemList = useMemo(() => {
		if (!formMeta) return null
		return Object.entries(formMeta.config).map(([name, value]) => {
			const FormComponent = FormMap[value.type]
			return (
				<Form.Item required key={name} name={name} label={value.name}>
					<FormComponent config={value.value} />
				</Form.Item>
			)
		})
	}, [formMeta])

	useEffect(() => {
		if (!formMeta) return
		form.setFieldsValue(formMeta.value)
	}, [form, formMeta])

	const handleUpdate = (value: any) => {
		if (!formMeta) return
		boundActions.update({
			value,
			id: formMeta.id,
		})
	}
	return (
		<>
			<div
				className={classNames(styles.container, {
					[styles.collapsed]: collapsed,
				})}
			>
				{formMeta ? (
					<>
						<Typography.Title level={4} className='mb-8'>
							配置属性
						</Typography.Title>
						<Form
							initialValues={formMeta.value}
							form={form}
							onFinish={handleUpdate}
						>
							{FormItemList}

							<Button block type='primary' htmlType='submit'>
								修改
							</Button>
						</Form>
					</>
				) : (
					<Result
						status='404'
						title='请选中组件'
						subTitle='选择组件 修改属性'
						className='px-0 py-0 pt-56'
					/>
				)}
			</div>
			{/* trigger */}
			<div
				className={classNames(styles.trigger, {
					[styles.collapsed]: collapsed,
				})}
				onClick={toggle as any}
			>
				{collapsed ? <DoubleLeftOutlined /> : <DoubleRightOutlined />}
			</div>
			<div
				className={classNames(styles.placeholder, {
					[styles.collapsed]: collapsed,
				})}
			></div>
		</>
	)
}

export default Attribute
