import React, { ComponentType, Fragment, lazy, memo } from "react"
import { Redirect, Route, Switch } from "react-router-dom"
import { IRoute } from "@/@types/route"
import { IBaseProps } from "@/@types/fc"
import WithLazyLoad from "@/hocs/WithLazyLoad"

interface IProps {
	routes: IRoute[]
}
function RenderRoutes(props: IProps) {
	const { routes } = props
	return (
		<Switch>
			{routes
				?.concat({
					key: "error",
					component: WithLazyLoad(lazy(() => import("@/pages/404"))), // 给每个routes字段添加匹配失败的路由
				})
				.map((item) => {
					const { component, wrap, routes, exact, redirect, path } = item
					const Wrap = wrap ?? Fragment
					const RouteComponent = component as ComponentType<IBaseProps>
					return (
						<Route
							key={item.path ?? item.key}
							exact={!item.routes} // 根据routes 属性 决定是否采用严格模式
							path={path}
							render={(props) => {
								return (
									<Wrap>
										{redirect ? (
											<Redirect to={redirect as string} />
										) : (
											<RouteComponent {...props} routes={routes}>
												{routes && <RenderRoutes routes={routes} />}
											</RouteComponent>
										)}
									</Wrap>
								)
							}}
						/>
					)
				})}
		</Switch>
	)
}

export default memo(RenderRoutes)
