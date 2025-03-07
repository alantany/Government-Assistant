"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

export default function SettingsPanel() {
  const [autoSpeak, setAutoSpeak] = useState(false)

  useEffect(() => {
    // 从 localStorage 读取设置
    const savedSetting = localStorage.getItem('autoSpeak')
    if (savedSetting !== null) {
      setAutoSpeak(savedSetting === 'true')
    }
  }, [])

  const handleAutoSpeakChange = (checked: boolean) => {
    setAutoSpeak(checked)
    // 保存设置到 localStorage
    localStorage.setItem('autoSpeak', checked.toString())
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">系统设置</h3>
      <div className="flex items-center space-x-4">
        <Switch
          id="auto-speak"
          checked={autoSpeak}
          onCheckedChange={handleAutoSpeakChange}
        />
        <Label htmlFor="auto-speak">自动朗读回答</Label>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        开启后系统将自动朗读AI助手的回答，关闭后需手动点击播放按钮进行朗读
      </p>
    </div>
  )
} 