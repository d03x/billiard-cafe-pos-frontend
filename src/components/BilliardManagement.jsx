import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Clock, User, Calendar, Plus } from 'lucide-react'
import ApiService from '../services/api'

export default function BilliardManagement() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false)
  const [newReservation, setNewReservation] = useState({
    table_id: '',
    customer_name: '',
    start_time: '',
    end_time: ''
  })

  const tables = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Table ${i + 1}`
  }))

  useEffect(() => {
    loadReservations()
    // Set up polling for real-time updates
    const interval = setInterval(loadReservations, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const loadReservations = async () => {
    try {
      const response = await ApiService.getReservations()
      setReservations(response.data || [])
      setError(null)
    } catch (err) {
      setError('Failed to load reservations: ' + err.message)
      console.error('Error loading reservations:', err)
    } finally {
      setLoading(false)
    }
  }

  const createReservation = async () => {
    if (!newReservation.table_id || !newReservation.customer_name || 
        !newReservation.start_time || !newReservation.end_time) {
      setError('Please fill in all fields')
      return
    }

    try {
      await ApiService.createReservation(newReservation)
      setIsNewReservationOpen(false)
      setNewReservation({ table_id: '', customer_name: '', start_time: '', end_time: '' })
      await loadReservations()
    } catch (err) {
      setError('Failed to create reservation: ' + err.message)
      console.error('Error creating reservation:', err)
    }
  }

  const updateReservationStatus = async (reservationId, status) => {
    try {
      await ApiService.updateReservationStatus(reservationId, status)
      await loadReservations()
    } catch (err) {
      setError('Failed to update reservation: ' + err.message)
      console.error('Error updating reservation:', err)
    }
  }

  const deleteReservation = async (reservationId) => {
    try {
      await ApiService.deleteReservation(reservationId)
      await loadReservations()
    } catch (err) {
      setError('Failed to delete reservation: ' + err.message)
      console.error('Error deleting reservation:', err)
    }
  }

  const getTableStatus = (tableId) => {
    const tableReservations = reservations.filter(r => r.table_id === `Table ${tableId}`)
    
    // Check for active reservation
    const activeReservation = tableReservations.find(r => r.status === 'active')
    if (activeReservation) {
      return { status: 'occupied', reservation: activeReservation }
    }

    // Check for reserved reservation
    const reservedReservation = tableReservations.find(r => r.status === 'reserved')
    if (reservedReservation) {
      return { status: 'reserved', reservation: reservedReservation }
    }

    return { status: 'available', reservation: null }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied': return 'bg-red-100 text-red-800 border-red-200'
      case 'reserved': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'available': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getReservationStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'reserved': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading reservations...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Billiard Management</h1>
          <p className="text-gray-600">Manage table reservations and billiard operations</p>
        </div>
        <Dialog open={isNewReservationOpen} onOpenChange={setIsNewReservationOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Reservation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Reservation</DialogTitle>
              <DialogDescription>
                Book a table for a customer
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="table_id">Table</Label>
                <select
                  id="table_id"
                  value={newReservation.table_id}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, table_id: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a table</option>
                  {tables.map((table) => (
                    <option key={table.id} value={table.name}>
                      {table.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={newReservation.customer_name}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, customer_name: e.target.value }))}
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={newReservation.start_time}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={newReservation.end_time}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewReservationOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createReservation}>
                Create Reservation
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

      {/* Table Status Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Table Status Overview</CardTitle>
          <CardDescription>Current status of all billiard tables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {tables.map((table) => {
              const tableStatus = getTableStatus(table.id)
              return (
                <Card 
                  key={table.id} 
                  className={`p-4 text-center ${getStatusColor(tableStatus.status)}`}
                >
                  <div className="font-semibold">{table.name}</div>
                  <div className="text-sm mt-1 capitalize">{tableStatus.status}</div>
                  {tableStatus.reservation && (
                    <div className="text-xs mt-1">
                      {tableStatus.reservation.customer_name}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <Card>
        <CardHeader>
          <CardTitle>Reservations</CardTitle>
          <CardDescription>All billiard table reservations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reservations found. Create your first reservation!
              </div>
            ) : (
              reservations.map((reservation) => (
                <Card key={reservation.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <div>
                        <h3 className="font-semibold">{reservation.table_id}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {reservation.customer_name}
                        </p>
                      </div>
                    </div>
                    <Badge className={getReservationStatusColor(reservation.status)}>
                      {reservation.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDateTime(reservation.start_time)} - {formatDateTime(reservation.end_time)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {reservation.status === 'reserved' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => updateReservationStatus(reservation.id, 'active')}
                        >
                          Start Session
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteReservation(reservation.id)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {reservation.status === 'active' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => updateReservationStatus(reservation.id, 'completed')}
                        >
                          End Session
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteReservation(reservation.id)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

