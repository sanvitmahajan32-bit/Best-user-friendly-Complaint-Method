import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { Clock, CheckCircle2, AlertCircle, MapPin, Calendar } from 'lucide-react';
import { cn } from '../utils';
import { handleFirestoreError, OperationType } from '../firestore-errors';

interface Complaint {
  id: string;
  category: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  createdAt: Timestamp;
  location: { latitude: number; longitude: number };
  imageUrl?: string;
}

interface ComplaintListProps {
  userId: string;
}

export default function ComplaintList({ userId }: ComplaintListProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'complaints'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Complaint[];
      setComplaints(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'complaints');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
        <p className="text-stone-500 font-medium">Loading your complaints...</p>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-sm">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-stone-400" />
        </div>
        <h3 className="text-xl font-bold text-stone-900 mb-2">No complaints yet</h3>
        <p className="text-stone-500 max-w-xs mx-auto">
          Start by reporting a sanitation or waste management issue in your area.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <div
          key={complaint.id}
          className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-stone-900">{complaint.category}</h3>
                <div className="flex items-center gap-4 text-xs font-medium text-stone-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {complaint.createdAt?.toDate().toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {complaint.location.latitude.toFixed(4)}, {complaint.location.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
              <StatusBadge status={complaint.status} />
            </div>

            {complaint.description && (
              <p className="text-stone-600 text-sm mb-4 line-clamp-2">
                {complaint.description}
              </p>
            )}

            {complaint.imageUrl && (
              <div className="mt-4 rounded-xl overflow-hidden border border-stone-100 bg-stone-50">
                <img
                  src={complaint.imageUrl}
                  alt="Evidence"
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: Complaint['status'] }) {
  const configs = {
    'Pending': { icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-200' },
    'In Progress': { icon: AlertCircle, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    'Resolved': { icon: CheckCircle2, color: 'bg-green-100 text-green-700 border-green-200' }
  };

  const { icon: Icon, color } = configs[status];

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border",
      color
    )}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </div>
  );
}
