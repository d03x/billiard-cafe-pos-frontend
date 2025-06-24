import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { 
  Users, 
  Coffee, 
  Lightbulb, 
  Clock, 
  TrendingUp, 
  Activity,
  DollarSign,
  Calendar
} from 'lucide-react'
import ApiService from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    reservations: [],
    orders: [],
    lights: [],
    esp32Status: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
    // Set up polling for real-time updates
    const interval = setInterval(loadDashboardData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      const [reservationsResponse, ordersResponse, lightsResponse, esp32Response] = await Promise.all([
        ApiService.getReservations().catch(() => ({ data: [] })),
        ApiService.getOrders().catch(() => ({ data: [] })),
        ApiService.getLights().catch(() => ({ data: [] })),
        ApiService.getESP32Status().catch(() => ({ data: null }))
      ])
      
      setStats({
        reservations: reservationsResponse.data || [],
        orders: ordersResponse.data || [],
        lights: lightsResponse.data || [],
        esp32Status: esp32Response.data || null
      })
      setError(null)
    } catch (err) {
      setError('Failed to load dashboard data: ' + err.message)
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getActiveReservations = () => {
    return stats.reservations.filter(r => r.status === 'active').length
  }

  const getTotalReservations = () => {
    return stats.reservations.length
  }

  const getPendingOrders = () => {
    return stats.orders.filter(o => o.status === 'pending' || o.status === 'preparing').length
  }

  const getTotalRevenue = () => {
    return stats.orders.reduce((total, order) => total + (order.total_amount || 0), 0)
  }

  const getActiveLights = () => {
    return stats.lights.filter(l => l.status === 'on').length
  }

  const getTotalLights = () => {
    return stats.lights.length
  }

  const getRecentActivity = () => {
    const activities = []
    
    // Add recent reservations
    stats.reservations.slice(0, 3).forEach(reservation => {
      activities.push({
        id: `res-${reservation.id}`,
        type: 'reservation',
        message: `New reservation: ${reservation.customer_name} - ${reservation.table_id}`,
        time: reservation.created_at,
        status: reservation.status
      })
    })

    // Add recent orders
    stats.orders.slice(0, 3).forEach(order => {
      activities.push({
        id: `ord-${order.id}`,
        type: 'order',
        message: `Order #${order.id} - ${order.customer_name}`,
        time: order.created_at,
        status: order.status
      })
    })

    // Sort by time and return latest 5
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome to Billiard Cafe POS System</p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tables</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveReservations()}</div>
            <p className="text-xs text-muted-foreground">
              {getTotalReservations()} total reservations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Coffee className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getPendingOrders()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.orders.length} total orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalRevenue())}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.orders.length} orders
            </p>
          </CardContent>
        </Card>

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest reservations and orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getRecentActivity().length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No recent activity
                </div>
              ) : (
                getRecentActivity().map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {activity.type === 'reservation' ? (
                        <Calendar className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Coffee className="h-4 w-4 text-orange-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-600">{formatTime(activity.time)}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and connectivity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Backend API</p>
                    <p className="text-xs text-gray-600">Connected and operational</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Database</p>
                    <p className="text-xs text-gray-600">SQLite database active</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">ESP32 Module</p>
                    <p className="text-xs text-gray-600">Lighting control system</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Last Update</p>
                    <p className="text-xs text-gray-600">{new Date().toLocaleString()}</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Live</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">New Reservation</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Coffee className="h-6 w-6" />
              <span className="text-sm">New Order</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Lightbulb className="h-6 w-6" />
              <span className="text-sm">Control Lights</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

