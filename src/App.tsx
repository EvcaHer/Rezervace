import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Shield, Plus, Trash2, Edit, LogOut, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface Booking {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
}

interface Event {
  id: string;
  date: string;
  time: string;
  topic: string;
  maxParticipants: number;
  bookings: Booking[];
}

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [bookingForm, setBookingForm] = useState({ name: '', email: '' });
  const [eventForm, setEventForm] = useState({
    date: '',
    time: '',
    topic: '',
    maxParticipants: 10
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  const ADMIN_PASSWORD = 'admin123';

  useEffect(() => {
    const savedEvents = localStorage.getItem('bookingEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      // Sample data
      const sampleEvents: Event[] = [
        {
          id: '1',
          date: '2025-01-25',
          time: '14:00',
          topic: 'Webový vývoj s React.js',
          maxParticipants: 15,
          bookings: [
            {
              id: '1',
              name: 'Jana Nováková',
              email: 'jana@example.com',
              registeredAt: new Date().toISOString()
            }
          ]
        },
        {
          id: '2',
          date: '2025-01-28',
          time: '10:30',
          topic: 'UX/UI Design Workshop',
          maxParticipants: 8,
          bookings: []
        },
        {
          id: '3',
          date: '2025-02-02',
          time: '16:00',
          topic: 'TypeScript Masterclass',
          maxParticipants: 12,
          bookings: [
            {
              id: '2',
              name: 'Petr Svoboda',
              email: 'petr@example.com',
              registeredAt: new Date().toISOString()
            },
            {
              id: '3',
              name: 'Marie Dvořáková',
              email: 'marie@example.com',
              registeredAt: new Date().toISOString()
            }
          ]
        }
      ];
      setEvents(sampleEvents);
      localStorage.setItem('bookingEvents', JSON.stringify(sampleEvents));
    }
  }, []);

  const saveEvents = (newEvents: Event[]) => {
    setEvents(newEvents);
    localStorage.setItem('bookingEvents', JSON.stringify(newEvents));
  };

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type };
    setToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLogin(false);
      setPassword('');
      showToast('Úspěšně přihlášen jako administrátor', 'success');
    } else {
      showToast('Nesprávné heslo', 'error');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    showToast('Úspěšně odhlášen', 'info');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('cs-CZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBooking = () => {
    if (!selectedEvent || !bookingForm.name.trim() || !bookingForm.email.trim()) {
      showToast('Vyplňte všechna pole', 'error');
      return;
    }

    if (selectedEvent.bookings.length >= selectedEvent.maxParticipants) {
      showToast('Termín je již plně obsazen', 'error');
      return;
    }

    // Check if email already exists
    if (selectedEvent.bookings.some(b => b.email === bookingForm.email)) {
      showToast('Tento email je již registrován na tento termín', 'error');
      return;
    }

    const newBooking: Booking = {
      id: Date.now().toString(),
      name: bookingForm.name,
      email: bookingForm.email,
      registeredAt: new Date().toISOString()
    };

    const updatedEvents = events.map(event => 
      event.id === selectedEvent.id 
        ? { ...event, bookings: [...event.bookings, newBooking] }
        : event
    );

    saveEvents(updatedEvents);
    setShowBookingModal(false);
    setBookingForm({ name: '', email: '' });
    setSelectedEvent(null);
    showToast('Rezervace byla úspěšně vytvořena', 'success');
  };

  const handleDeleteBooking = (eventId: string, bookingId: string) => {
    const updatedEvents = events.map(event =>
      event.id === eventId
        ? { ...event, bookings: event.bookings.filter(b => b.id !== bookingId) }
        : event
    );
    saveEvents(updatedEvents);
    showToast('Rezervace byla zrušena', 'info');
  };

  const handleSaveEvent = () => {
    if (!eventForm.date || !eventForm.time || !eventForm.topic.trim()) {
      showToast('Vyplňte všechna pole', 'error');
      return;
    }

    if (editingEvent) {
      const updatedEvents = events.map(event =>
        event.id === editingEvent.id
          ? { ...event, ...eventForm }
          : event
      );
      saveEvents(updatedEvents);
      showToast('Termín byl aktualizován', 'success');
    } else {
      const newEvent: Event = {
        id: Date.now().toString(),
        ...eventForm,
        bookings: []
      };
      saveEvents([...events, newEvent]);
      showToast('Nový termín byl vytvořen', 'success');
    }

    setShowEventModal(false);
    setEditingEvent(null);
    setEventForm({ date: '', time: '', topic: '', maxParticipants: 10 });
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Opravdu chcete smazat tento termín? Všechny rezervace budou také smazány.')) {
      const updatedEvents = events.filter(event => event.id !== eventId);
      saveEvents(updatedEvents);
      showToast('Termín byl smazán', 'info');
    }
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      date: event.date,
      time: event.time,
      topic: event.topic,
      maxParticipants: event.maxParticipants
    });
    setShowEventModal(true);
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setEventForm({ date: '', time: '', topic: '', maxParticipants: 10 });
    setShowEventModal(true);
  };

  const getAvailableSpots = (event: Event) => {
    return event.maxParticipants - event.bookings.length;
  };

  const getStatusColor = (event: Event) => {
    const available = getAvailableSpots(event);
    if (available === 0) return 'bg-red-100 text-red-800';
    if (available <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">BookingSystem</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAdmin ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    Administrátor
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Odhlásit</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAdmin && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Správa termínů</h2>
              <button
                onClick={openCreateModal}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Nový termín</span>
              </button>
            </div>
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {event.topic}
                  </h3>
                  {isAdmin && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(event)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">{event.time}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {event.bookings.length} / {event.maxParticipants} účastníků
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event)}`}>
                    {getAvailableSpots(event) === 0 ? 'Obsazeno' : `${getAvailableSpots(event)} volných míst`}
                  </span>
                </div>

                {event.bookings.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Přihlášení účastníci:</h4>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {event.bookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                          <span>{booking.name}</span>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteBooking(event.id, booking.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isAdmin && (
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowBookingModal(true);
                    }}
                    disabled={getAvailableSpots(event) === 0}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      getAvailableSpots(event) === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {getAvailableSpots(event) === 0 ? 'Obsazeno' : 'Rezervovat'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné termíny</h3>
            <p className="text-gray-500">
              {isAdmin ? 'Vytvořte první termín pomocí tlačítka "Nový termín".' : 'Momentálně nejsou k dispozici žádné termíny.'}
            </p>
          </div>
        )}
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Administrátorské přihlášení</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Heslo</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  placeholder="Zadejte administrátorské heslo"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowLogin(false);
                  setPassword('');
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Zrušit
              </button>
              <button
                onClick={handleLogin}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Přihlásit
              </button>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Demo heslo:</strong> admin123
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rezervace termínu</h2>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900">{selectedEvent.topic}</h3>
              <p className="text-sm text-blue-700">
                {formatDate(selectedEvent.date)} v {selectedEvent.time}
              </p>
              <p className="text-sm text-blue-700">
                Volných míst: {getAvailableSpots(selectedEvent)}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jméno a příjmení</label>
                <input
                  type="text"
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Jan Novák"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="jan@example.com"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingForm({ name: '', email: '' });
                  setSelectedEvent(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Zrušit
              </button>
              <button
                onClick={handleBooking}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Rezervovat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingEvent ? 'Upravit termín' : 'Nový termín'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Čas</label>
                <input
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téma</label>
                <input
                  type="text"
                  value={eventForm.topic}
                  onChange={(e) => setEventForm({ ...eventForm, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Název termínu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximální počet účastníků</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={eventForm.maxParticipants}
                  onChange={(e) => setEventForm({ ...eventForm, maxParticipants: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEvent(null);
                  setEventForm({ date: '', time: '', topic: '', maxParticipants: 10 });
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Zrušit
              </button>
              <button
                onClick={handleSaveEvent}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingEvent ? 'Uložit' : 'Vytvořit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0 ${
              toast.type === 'success' ? 'bg-green-500 text-white' :
              toast.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
            {toast.type === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
            {toast.type === 'info' && <AlertCircle className="h-5 w-5 mr-2" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;