import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database,
  Wifi,
  Save,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react'

export function Settings() {
  const [settings, setSettings] = useState({
    // General Settings
    cafeName: 'Billiard Cafe Premium',
    address: 'Jl. Sudirman No. 123, Jakarta',
    phone: '+62 21 1234 5678',
    email: 'info@billiardcafe.com',
    
    // System Settings
    autoBackup: true,
    notifications: true,
    darkMode: false,
    language: 'id',
    timezone: 'Asia/Jakarta',
    
    // POS Settings
    taxRate: 10,
    currency: 'IDR',
    receiptFooter: 'Terima kasih atas kunjungan Anda!',
    
    // ESP32 Settings
    esp32IP: '192.168.1.100',
    esp32Port: '80',
    connectionTimeout: 5000,
    
    // Security Settings
    sessionTimeout: 30,
    requirePassword: true,
    twoFactorAuth: false
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Here you would make actual API call to save settings
      console.log('Settings saved:', settings)
      
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'billiard-cafe-settings.json'
    link.click()
  }

  const handleImportSettings = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result)
          setSettings(prev => ({ ...prev, ...importedSettings }))
        } catch (error) {
          console.error('Error importing settings:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your billiard cafe POS system</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".json"
            onChange={handleImportSettings}
            className="hidden"
            id="import-settings"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('import-settings').click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic information about your cafe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cafeName">Cafe Name</Label>
              <Input
                id="cafeName"
                value={settings.cafeName}
                onChange={(e) => handleSettingChange('cafeName', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => handleSettingChange('address', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleSettingChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

    
      

        {/* ESP32 Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wifi className="mr-2 h-5 w-5" />
              ESP32 Settings
            </CardTitle>
            <CardDescription>ESP32 module connection settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="esp32IP">ESP32 IP Address</Label>
                <Input
                  id="esp32IP"
                  value={settings.esp32IP}
                  onChange={(e) => handleSettingChange('esp32IP', e.target.value)}
                  placeholder="192.168.1.100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="esp32Port">Port</Label>
                <Input
                  id="esp32Port"
                  value={settings.esp32Port}
                  onChange={(e) => handleSettingChange('esp32Port', e.target.value)}
                  placeholder="80"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="connectionTimeout">Connection Timeout (ms)</Label>
              <Input
                id="connectionTimeout"
                type="number"
                value={settings.connectionTimeout}
                onChange={(e) => handleSettingChange('connectionTimeout', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              System Information
            </CardTitle>
            <CardDescription>Application and system details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Application Version:</span>
                <span className="font-mono">v1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Database Version:</span>
                <span className="font-mono">PostgreSQL 14.2</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Backup:</span>
                <span>Today, 03:00 AM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">System Uptime:</span>
                <span>7 days, 14 hours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Storage Used:</span>
                <span>2.3 GB / 10 GB</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Check for Updates
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


export default Settings

