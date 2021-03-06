// Axios 二次封装
import Axios, {
	AxiosStatic,
	AxiosRequestConfig,
	AxiosError,
	AxiosResponse,
} from "axios"
import LocalStore from "@/utils/LocalStore"
import { message } from "antd"
import configs from "@/configs/app"
import LoginUtil from "@/utils/LoginUtil"

// type Method = "get" | "post" | "delete" | "head" | "put" | "options" | "patch"

class Http {
	private axios: AxiosStatic = Axios
	private timer: number = NaN

	private retryDelay: number = configs.RETRY_DELAY
	private retryCount: number = configs.RETRY_COUNT

	constructor() {
		const { axios } = this
		this.defaultConfig(axios)

		// 拦截器
		this.requestIntercept(axios)
		this.responseIntercept(axios)
	}

	// axios 默认值
	private defaultConfig(axios: AxiosStatic) {
		axios.defaults.timeout = configs.TIMEOUT
		axios.defaults.baseURL = configs.BASE_URL
		axios.defaults.headers = {
			"Content-Type": "application/json;charset=utf-8",
		}
	}

	// 请求拦截器
	private requestIntercept(axios: AxiosStatic) {
		axios.interceptors.request.use(
			async (config: AxiosRequestConfig) => {
				const token = LocalStore.get(configs.TOKEN)
				if (token) config.headers.authToken = token
				return config
			},
			(error) => {
				return Promise.reject(error)
			}
		)
	}

	// 响应拦截器
	private responseIntercept(axios: AxiosStatic) {
		axios.interceptors.response.use(
			async (response: AxiosResponse) => {
				/**
				 * 处理各种错误码逻辑
				 */
				const {
					status,
					data: { code },
				} = response
				console.group("响应拦截器")
				console.log(response)
				console.groupEnd()
				// 与后台协商接口状态
				if (status === 200 || code === 200) {
					return response
				}
				if (code === 10001) {
					// token 过期
					LoginUtil.clearToken()
				}
				this.showError(response)
				return Promise.reject(response)
			},
			// 多半是服务器问题
			(error: AxiosError) => {
				// 为了更好的提示动画
				this.showError(error)
				console.group("响应拦截器error callback")
				console.error(error)
				console.groupEnd()
				return Promise.reject(error)
			}
		)
	}

	// antd message 更流畅
	private showError(error: any) {
		window.clearTimeout(this.timer)
		this.timer = window.setTimeout(() => {
			message.error({
				key: error?.statusText ?? error?.message,
				content: error?.statusText ?? error?.message,
			})
		}, 300)
	}
	// get请求会被缓存,添加一个随机字符串确保得到最新的结果
	public get<R = any>(url: string, params?: Object) {
		return this.axios.get<R>(url, { params: { ...params, _t: Date.now() } })
	}

	// post
	public post<R = any>(
		url: string,
		data: Object,
		options?: AxiosRequestConfig
	) {
		return this.axios.post<R>(url, data, options)
	}

	// put
	public put<R = any>(url: string, data: Object, options?: AxiosRequestConfig) {
		return this.axios.put<R>(url, data, options)
	}

	// delete
	public delete<R = any>(url: string, options?: AxiosRequestConfig) {
		return this.axios.delete<R>(url, options)
	}
}

export default new Http()
