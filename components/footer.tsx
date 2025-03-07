export default function Footer() {
  return (
    <footer className="w-full bg-blue-900 text-white/80 py-6 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">联系方式</h3>
            <p className="mb-1">服务热线: 12345</p>
            <p className="mb-1">工作时间: 周一至周五 9:00-17:00</p>
            <p>邮箱: service@gov.example.cn</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">快速链接</h3>
            <p className="mb-1">办事大厅地址查询</p>
            <p className="mb-1">在线预约</p>
            <p>意见反馈</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">关注我们</h3>
            <p className="mb-1">微信公众号: 智慧政务</p>
            <p>政务服务小程序</p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-blue-800 text-center text-sm">
          <p>© 2025 智慧政务服务平台 版权所有 | 网站备案号: 12345678</p>
        </div>
      </div>
    </footer>
  )
}

