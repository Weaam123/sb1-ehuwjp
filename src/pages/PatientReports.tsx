import React from 'react';
import { useForm } from 'react-hook-form';
import { FileText, Download, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { PatientReport } from '../types';
import { usePatientReportStore } from '../stores/patientReportStore';
import PatientReportForm from '../components/PatientReportForm';

export default function PatientReports() {
  const { reports, loadReports } = usePatientReportStore();
  const [showForm, setShowForm] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleDownloadPDF = async (report: PatientReport) => {
    try {
      const blob = await generatePDF(report);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patient-report-${report.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Patient Reports</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Report
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Care Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(report.timestamp, 'dd MMM yyyy')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(report.timestamp, 'HH:mm')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{report.patientId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {report.careLevel}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report.staffId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setSelectedReport(report.id)}
                    className="text-teal-600 hover:text-teal-900 mr-3"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(report)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(showForm || selectedReport) && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedReport ? 'View Report' : 'New Patient Report'}
            </h2>
            <PatientReportForm
              initialData={reports.find(r => r.id === selectedReport)}
              onSuccess={() => {
                setShowForm(false);
                setSelectedReport(null);
                loadReports();
              }}
              onCancel={() => {
                setShowForm(false);
                setSelectedReport(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

async function generatePDF(report: PatientReport): Promise<Blob> {
  const { PDFDocument, rgb } = await import('@react-pdf/renderer');
  
  const doc = await PDFDocument.create();
  const page = doc.addPage();
  const { width, height } = page.getSize();

  // Add content to PDF
  page.drawText('Patient Report', {
    x: 50,
    y: height - 50,
    size: 20,
  });

  // Add more report details...

  return doc.save();
}</content></file>

<boltAction type="file" filePath="src/components/PatientReportForm.tsx">import React from 'react';
import { useForm } from 'react-hook-form';
import { PatientReport } from '../types';
import { usePatientReportStore } from '../stores/patientReportStore';

type PatientReportFormData = Omit<PatientReport, 'id' | 'timestamp'>;

interface PatientReportFormProps {
  initialData?: PatientReport;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PatientReportForm({
  initialData,
  onSuccess,
  onCancel,
}: PatientReportFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<PatientReportFormData>({
    defaultValues: initialData,
  });
  const { addReport, updateReport } = usePatientReportStore();

  const onSubmit = async (data: PatientReportFormData) => {
    try {
      if (initialData) {
        await updateReport(initialData.id, data);
      } else {
        await addReport(data);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save report:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Patient ID</label>
          <input
            type="text"
            {...register('patientId', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Care Level</label>
          <select
            {...register('careLevel', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          >
            <option value="">Select level</option>
            <option value="ALS">Advanced Life Support</option>
            <option value="ILS">Intermediate Life Support</option>
            <option value="BLS">Basic Life Support</option>
          </select>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Clinical Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Blood Pressure</label>
            <input
              type="text"
              {...register('clinicalInfo.vitals.bp')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pulse</label>
            <input
              type="text"
              {...register('clinicalInfo.vitals.pulse')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Temperature</label>
            <input
              type="text"
              {...register('clinicalInfo.vitals.temp')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">SpO2</label>
            <input
              type="text"
              {...register('clinicalInfo.vitals.spo2')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Treatment Notes</label>
        <textarea
          {...register('clinicalInfo.treatment')}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Handover Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Facility</label>
            <input
              type="text"
              {...register('handover.facility')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Staff Member</label>
            <input
              type="text"
              {...register('handover.staff')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <input
              type="time"
              {...register('handover.time')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          {initialData ? 'Update' : 'Save'}
        </button>
      </div>
    </form>
  );
}</content></file>

<boltAction type="file" filePath="src/stores/patientReportStore.ts">import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PatientReport } from '../types';
import { db } from '../utils/db';

interface PatientReportState {
  reports: PatientReport[];
  loading: boolean;
  error: string | null;
  addReport: (data: Omit<PatientReport, 'id' | 'timestamp'>) => Promise<void>;
  updateReport: (id: string, data: Partial<PatientReport>) => Promise<void>;
  loadReports: () => Promise<void>;
}

export const usePatientReportStore = create<PatientReportState>()(
  persist(
    (set, get) => ({
      reports: [],
      loading: false,
      error: null,
      addReport: async (data) => {
        try {
          const id = crypto.randomUUID();
          const newReport = {
            ...data,
            id,
            timestamp: Date.now(),
          };
          await db.add('reports', newReport);
          set((state) => ({
            reports: [...state.reports, newReport],
            error: null,
          }));
        } catch (error) {
          set({ error: 'Failed to add report' });
          throw error;
        }
      },
      updateReport: async (id, data) => {
        try {
          const updatedReport = {
            ...get().reports.find((r) => r.id === id),
            ...data,
          };
          await db.put('reports', updatedReport);
          set((state) => ({
            reports: state.reports.map((r) =>
              r.id === id ? updatedReport : r
            ),
            error: null,
          }));
        } catch (error) {
          set({ error: 'Failed to update report' });
          throw error;
        }
      },
      loadReports: async () => {
        set({ loading: true });
        try {
          const reports = await db.getAll('reports');
          set({ reports, loading: false, error: null });
        } catch (error) {
          set({ loading: false, error: 'Failed to load reports' });
          throw error;
        }
      },
    }),
    {
      name: 'patient-report-storage',
    }
  )
);</content></file>

<boltAction type="start">
<command>npm run dev</command>