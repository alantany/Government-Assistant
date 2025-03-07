import Image from "next/image"

export default function Header() {
  return (
    <header className="w-full bg-blue-800 text-white py-4 px-6 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <Image
              src="/placeholder.svg?height=40&width=40"
              alt="政府标志"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
          <h1 className="text-xl md:text-2xl font-bold">智慧政务服务平台</h1>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <span className="text-white/90">办事指南</span>
          <span className="text-white/90">政策查询</span>
          <span className="text-white/90">常见问题</span>
          <span className="text-white/90">联系我们</span>
        </div>
      </div>
    </header>
  )
}

