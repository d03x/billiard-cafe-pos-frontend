import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Plus, Coffee, UtensilsCrossed, Cake, GlassWater } from 'lucide-react'
import ApiService from '../services/api'

export default function CafeOrders() {
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)
  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    items: [],
    total_amount: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ordersResponse, menuResponse] = await Promise.all([
        ApiService.getOrders(),
        ApiService.getMenuItems()
      ])
      
      setOrders(ordersResponse.data || [])
      setMenuItems(menuResponse.data || [])
      setError(null)
    } catch (err) {
      setError('Failed to load data: ' + err.message)
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ApiService.updateOrderStatus(orderId, newStatus)
      await loadData() // Reload data to get updated status
    } catch (err) {
      setError('Failed to update order status: ' + err.message)
      console.error('Error updating order status:', err)
    }
  }

  const addItemToOrder = (menuItem) => {
    const existingItem = newOrder.items.find(item => item.item_id === menuItem.id)
    
    if (existingItem) {
      const updatedItems = newOrder.items.map(item =>
        item.item_id === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
      setNewOrder(prev => ({
        ...prev,
        items: updatedItems,
        total_amount: calculateTotal(updatedItems)
      }))
    } else {
      const newItem = {
        item_id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      }
      const updatedItems = [...newOrder.items, newItem]
      setNewOrder(prev => ({
        ...prev,
        items: updatedItems,
        total_amount: calculateTotal(updatedItems)
      }))
    }
  }

  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const submitOrder = async () => {
    if (!newOrder.customer_name || newOrder.items.length === 0) {
      setError('Please provide customer name and add at least one item')
      return
    }

    try {
      await ApiService.createOrder(newOrder)
      setIsNewOrderOpen(false)
      setNewOrder({ customer_name: '', items: [], total_amount: 0 })
      await loadData() // Reload data to show new order
    } catch (err) {
      setError('Failed to create order: ' + err.message)
      console.error('Error creating order:', err)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'preparing': return 'bg-blue-100 text-blue-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'coffee': return <Coffee className="h-4 w-4" />
      case 'food': return <UtensilsCrossed className="h-4 w-4" />
      case 'dessert': return <Cake className="h-4 w-4" />
      case 'beverage': return <GlassWater className="h-4 w-4" />
      default: return <Coffee className="h-4 w-4" />
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Cafe Orders</h1>
          <p className="text-gray-600">Manage menu items and process customer orders</p>
        </div>
        <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>
                Add items to create a new customer order
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={newOrder.customer_name}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, customer_name: e.target.value }))}
                  placeholder="Enter customer name"
                />
              </div>
              
              <div>
                <Label>Order Items</Label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {menuItems.map((item) => (
                    <Card key={item.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">{formatPrice(item.price)}</div>
                        </div>
                        <Button size="sm" onClick={() => addItemToOrder(item)}>
                          Add
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {newOrder.items.length > 0 && (
                <div>
                  <Label>Selected Items</Label>
                  <div className="space-y-2">
                    {newOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{item.quantity}x {item.name}</span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="font-bold text-lg pt-2 border-t">
                      Total: {formatPrice(newOrder.total_amount)}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewOrderOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitOrder}>
                Create Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Orders</CardTitle>
            <CardDescription>All cafe orders and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No orders found. Create your first order!
                </div>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          <p className="text-sm text-gray-600">
                            {order.customer_name} • {new Date(order.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <div className="font-semibold">
                          {formatPrice(order.total_amount)}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h4 className="font-medium mb-2">Order Items:</h4>
                      <div className="space-y-1">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span>{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                        >
                          Start Preparing
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                        >
                          Mark Ready
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                        >
                          Complete Order
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Menu Items</CardTitle>
            <CardDescription>Available items in the cafe menu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(item.category)}
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-green-600">
                      {formatPrice(item.price)}
                    </div>
                    <Button size="sm" onClick={() => addItemToOrder(item)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

