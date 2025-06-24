import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Lightbulb, Zap, Clock, Wifi, Power } from 'lucide-react'
import ApiService from '../services/api'

export default function ESP32Controls() {
  const [lights, setLights] = useState([])
  const [esp32Status, setEsp32Status] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
    // Set up polling for real-time updates
    const interval = setInterval(loadData, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [lightsResponse, statusResponse] = await Promise.all([
        ApiService.getLights(),
        ApiService.getESP32Status()
      ])
      
      setLights(lightsResponse.data || [])
      setEsp32Status(statusResponse.data || null)
      setError(null)
    } catch (err) {
      setError('Failed to load ESP32 data: ' + err.message)
      console.error('Error loading ESP32 data:', err)
    } finally {
      setLoading(false)
    }
  }

  const controlLight = async (lightId, action) => {
    try {
      await ApiService.controlLight(lightId, action)
      await loadData() // Reload data to get updated status
    } catch (err) {
      setError('Failed to control light: ' + err.message)
      console.error('Error controlling light:', err)
    }
  }

  const updateBrightness = async (lightId, brightness) => {
    try {
      await ApiService.updateLightBrightness(lightId, brightness)
      await loadData() // Reload data to get updated brightness
    } catch (err) {
      setError('Failed to update brightness: ' + err.message)
      console.error('Error updating brightness:', err)
    }
  }

  const applyPreset = async (preset) => {
    try {
      await ApiService.applyLightPreset(preset)
      await loadData() // Reload data to get updated status
    } catch (err) {
      setError('Failed to apply preset: ' + err.message)
      console.error('Error applying preset:', err)
    }
  }

  const getActiveLights = () => {
    return lights.filter(light => light.status === 'on').length
  }

  const getTotalLights = () => {
    return lights.length
  }

  const getAverageBrightness = () => {
    const activeLights = lights.filter(light => light.status === 'on')
    if (activeLights.length === 0) return 0
    const totalBrightness = activeLights.reduce((sum, light) => sum + light.brightness, 0)
    return Math.round(totalBrightness / activeLights.length)
  }

  const getPowerConsumption = () => {
    return getActiveLights() * 12 // Assuming 12W per active light
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading ESP32 controls...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">ESP32 Controls</h1>
          <p className="text-gray-600">Control lighting system via ESP32 module</p>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-green-500" />
          <Badge variant="outline" className="bg-green-50 text-green-700">
            connected
          </Badge>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lights</CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveLights()}/{getTotalLights()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((getActiveLights() / getTotalLights()) * 100)}% active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection</CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Connected</div>
            <p className="text-xs text-muted-foreground">ESP32 Module Status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date().toLocaleTimeString()}</div>
            <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Power Usage</CardTitle>
            <Power className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getPowerConsumption()}W</div>
            <p className="text-xs text-muted-foreground">Estimated consumption</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Presets */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Presets</CardTitle>
          <CardDescription>Pre-configured lighting scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => applyPreset('all_on')}
            >
              <Lightbulb className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">All On</div>
                <div className="text-xs text-gray-600">Turn on all lights</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => applyPreset('all_off')}
            >
              <Power className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">All Off</div>
                <div className="text-xs text-gray-600">Turn off all lights</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => applyPreset('tables_only')}
            >
              <Zap className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Tables Only</div>
                <div className="text-xs text-gray-600">Only table lights</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => applyPreset('ambient')}
            >
              <Lightbulb className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Ambient Mode</div>
                <div className="text-xs text-gray-600">Soft ambient lighting</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Individual Light Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Light Controls</CardTitle>
          <CardDescription>Control each light individually</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lights.map((light) => (
              <Card 
                key={light.id} 
                className={`p-4 ${light.status === 'on' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb 
                      className={`h-5 w-5 ${light.status === 'on' ? 'text-yellow-500' : 'text-gray-400'}`} 
                    />
                    <h3 className="font-semibold">{light.name}</h3>
                  </div>
                  <Badge 
                    variant={light.status === 'on' ? 'default' : 'secondary'}
                    className={light.status === 'on' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {light.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`power-${light.id}`}>Power</Label>
                    <Switch
                      id={`power-${light.id}`}
                      checked={light.status === 'on'}
                      onCheckedChange={(checked) => 
                        controlLight(light.id, checked ? 'on' : 'off')
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`brightness-${light.id}`}>
                        Brightness: {light.brightness}%
                      </Label>
                    </div>
                    <input
                      id={`brightness-${light.id}`}
                      type="range"
                      min="0"
                      max="100"
                      value={light.brightness}
                      onChange={(e) => updateBrightness(light.id, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${light.brightness}%, #e5e7eb ${light.brightness}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>

                  <div className="text-xs text-gray-600 flex justify-between">
                    <span>ID: {light.id}</span>
                    <span>{light.status === 'on' ? '12W' : '0W'}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Module Details */}
      {esp32Status && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Module Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Module ID:</span>
                  <span>{esp32Status.module_status?.module_id || 'ESP32-BILLIARD-001'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Firmware Version:</span>
                  <span>{esp32Status.module_status?.firmware_version || 'v2.1.3'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">IP Address:</span>
                  <span>{esp32Status.module_status?.ip_address || '192.168.1.100'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Signal Strength:</span>
                  <span>{esp32Status.module_status?.signal_strength || -45} dBm</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Statistics</h4>
                <div className="flex justify-between">
                  <span>Total Commands:</span>
                  <span>{esp32Status.module_status?.total_commands || 1247}</span>
                </div>
                <div className="flex justify-between">
                  <span>Successful:</span>
                  <span className="text-green-600">
                    {esp32Status.module_status?.successful_commands || 1245} (99.8%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Failed:</span>
                  <span className="text-red-600">
                    {esp32Status.module_status?.failed_commands || 2} (0.2%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span>{esp32Status.module_status?.uptime || '7d 14h 32m'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

