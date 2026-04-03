// AdminStudentsPage.jsx — Admin can view, add, edit, and delete students

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import api from '@/utils/api'
import {
  Users, Search, Plus, Pencil, Trash2,
  X, Loader2, ChevronDown, ExternalLink
} from 'lucide-react'

// ── Small reusable Modal component ───────────────────────────
// We build our own simple modal so we don't need extra shadcn setup
function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    // Dark backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}  // click backdrop to close
    >
      {/* Modal box — stop click propagation so clicking inside doesn't close */}
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-display font-bold text-lg text-[#1A1A2E]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Modal content */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── Reusable text input field ─────────────────────────────────
function Field({ label, name, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all"
      />
    </div>
  )
}

// ── Main Page Component ───────────────────────────────────────
export default function AdminStudentsPage() {
  const navigate = useNavigate()

  // ── Data state ──────────────────────────────────────────────
  const [students,  setStudents]  = useState([])
  const [classes,   setClasses]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  // ── Filter state ────────────────────────────────────────────
  const [searchQuery,      setSearchQuery]      = useState('')
  const [selectedClassFilter, setSelectedClassFilter] = useState('all')

  // ── Modal state ─────────────────────────────────────────────
  const [showAddModal,    setShowAddModal]    = useState(false)
  const [showEditModal,   setShowEditModal]   = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  // ── Form state ──────────────────────────────────────────────
  const emptyForm = {
    name: '', email: '', parentEmail: '', rollNumber: '', classId: ''
  }
  const [form,        setForm]        = useState(emptyForm)
  const [formLoading, setFormLoading] = useState(false)
  const [formError,   setFormError]   = useState('')

  // ── Load data on mount ──────────────────────────────────────
  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch students and dashboard (for classes list) in parallel
      const [studentsRes, dashRes] = await Promise.all([
        api.get('/students'),
        api.get('/admin/dashboard'),
      ])

      setStudents(studentsRes.data.students)
      // Extract class list from admin dashboard stats
      setClasses(dashRes.data.classStats || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load students.')
    } finally {
      setLoading(false)
    }
  }

  // ── Filter logic ────────────────────────────────────────────
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesClass =
      selectedClassFilter === 'all' ||
      String(student.classId) === String(selectedClassFilter)

    return matchesSearch && matchesClass
  })

  // ── Form helpers ────────────────────────────────────────────
  const handleFormChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setFormError('') // clear error on any change
  }

  const validateForm = () => {
    if (!form.name.trim())        return 'Name is required.'
    if (!form.email.trim())       return 'Email is required.'
    if (!form.parentEmail.trim()) return 'Parent email is required.'
    if (!form.rollNumber.trim())  return 'Roll number is required.'
    if (!form.classId)            return 'Please select a class.'
    return null
  }

  // ── Open Add modal ──────────────────────────────────────────
  const openAdd = () => {
    setForm(emptyForm)
    setFormError('')
    setShowAddModal(true)
  }

  // ── Open Edit modal ─────────────────────────────────────────
  const openEdit = (student) => {
    setSelectedStudent(student)
    setForm({
      name:        student.name,
      email:       student.email,
      parentEmail: student.parentEmail,
      rollNumber:  student.rollNumber,
      classId:     String(student.classId),
    })
    setFormError('')
    setShowEditModal(true)
  }

  // ── Open Delete modal ───────────────────────────────────────
  const openDelete = (student) => {
    setSelectedStudent(student)
    setShowDeleteModal(true)
  }

  // ── Submit: Add student ─────────────────────────────────────
  const handleAdd = async () => {
    const validationError = validateForm()
    if (validationError) return setFormError(validationError)

    try {
      setFormLoading(true)
      setFormError('')
      await api.post('/students', form)
      await fetchAll() // refresh list
      setShowAddModal(false)
      setForm(emptyForm)
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to add student.')
    } finally {
      setFormLoading(false)
    }
  }

  // ── Submit: Edit student ────────────────────────────────────
  const handleEdit = async () => {
    const validationError = validateForm()
    if (validationError) return setFormError(validationError)

    try {
      setFormLoading(true)
      setFormError('')
      await api.put(`/students/${selectedStudent.id}`, form)
      await fetchAll()
      setShowEditModal(false)
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to update student.')
    } finally {
      setFormLoading(false)
    }
  }

  // ── Submit: Delete student ──────────────────────────────────
  const handleDelete = async () => {
    try {
      setFormLoading(true)
      await api.delete(`/students/${selectedStudent.id}`)
      await fetchAll()
      setShowDeleteModal(false)
      setSelectedStudent(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete student.')
    } finally {
      setFormLoading(false)
    }
  }

  // ── Student Form Fields (shared between Add and Edit) ───────
  const StudentFormFields = () => (
    <div className="space-y-4">
      <Field
        label="Full Name"      name="name"
        value={form.name}      onChange={handleFormChange}
        placeholder="e.g. Aarav Shah"  required
      />
      <Field
        label="Student Email"  name="email"
        value={form.email}     onChange={handleFormChange}
        type="email"           placeholder="student@school.com"  required
      />
      <Field
        label="Parent Email"   name="parentEmail"
        value={form.parentEmail} onChange={handleFormChange}
        type="email"           placeholder="parent@gmail.com"  required
      />
      <Field
        label="Roll Number"    name="rollNumber"
        value={form.rollNumber} onChange={handleFormChange}
        placeholder="e.g. 10A-11"  required
      />

      {/* Class dropdown */}
      <div>
        <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
          Class <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            name="classId"
            value={form.classId}
            onChange={handleFormChange}
            className="w-full appearance-none px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] pr-10 cursor-pointer"
          >
            <option value="">Select a class...</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
        </div>
      </div>

      {/* Form-level error */}
      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs text-red-600">{formError}</p>
        </div>
      )}
    </div>
  )

  // ── Render ──────────────────────────────────────────────────
  return (
    <Layout>

      {/* ── Page Header ──────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-[#EDE9FE] rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[#1A1A2E]">Manage Students</h1>
          </div>
          <p className="text-[#6B7280] text-sm ml-12">
            {students.length} students across {classes.length} classes
          </p>
        </div>

        {/* Add student button */}
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#7C3AED] hover:bg-[#5B21B6] text-white font-semibold text-sm rounded-xl transition-all duration-200 shrink-0 shadow-sm shadow-purple-200"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* ── Page-level error ─────────────────────────────── */}
      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      {/* ── Filters Row ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 mb-5 flex flex-col sm:flex-row gap-3">

        {/* Search box */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email or roll number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] transition-all"
          />
        </div>

        {/* Class filter dropdown */}
        <div className="relative sm:w-52">
          <select
            value={selectedClassFilter}
            onChange={e => setSelectedClassFilter(e.target.value)}
            className="w-full appearance-none px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] pr-10 cursor-pointer"
          >
            <option value="all">All Classes</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
        </div>
      </div>

      {/* ── Students Table ────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">

        {loading ? (
          <LoadingSpinner text="Loading students..." />
        ) : filteredStudents.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center py-16">
            <div className="w-14 h-14 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-3">
              <Users className="w-7 h-7 text-[#D1D5DB]" />
            </div>
            <p className="text-[#6B7280] font-medium">No students found</p>
            <p className="text-sm text-[#9CA3AF] mt-1">
              {searchQuery ? 'Try a different search term' : 'Add your first student'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB]">
                  {['Student', 'Roll No.', 'Class', 'Parent Email', 'Actions'].map(h => (
                    <th
                      key={h}
                      className="text-left px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {filteredStudents.map(student => (
                  <tr
                    key={student.id}
                    className="hover:bg-[#FAFAFA] transition-colors group"
                  >
                    {/* Name + email */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-[#EDE9FE] flex items-center justify-center shrink-0">
                          <span className="text-[#7C3AED] text-sm font-bold">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#1A1A2E]">{student.name}</p>
                          <p className="text-xs text-[#9CA3AF]">{student.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Roll number */}
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs bg-[#F3F4F6] text-[#374151] px-2.5 py-1 rounded-lg">
                        {student.rollNumber}
                      </span>
                    </td>

                    {/* Class */}
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold text-[#7C3AED] bg-[#EDE9FE] px-2.5 py-1 rounded-full">
                        {student.class?.name || '—'}
                      </span>
                    </td>

                    {/* Parent email */}
                    <td className="px-5 py-3.5 text-xs text-[#6B7280]">
                      {student.parentEmail}
                    </td>

                    {/* Action buttons */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">

                        {/* View profile */}
                        <button
                          onClick={() => navigate(`/students/${student.id}`)}
                          title="View Profile"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#EDE9FE] hover:text-[#7C3AED] transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEdit(student)}
                          title="Edit Student"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => openDelete(student)}
                          title="Delete Student"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table footer: showing X of Y results */}
            <div className="px-5 py-3 border-t border-[#F3F4F6] bg-[#FAFAFA]">
              <p className="text-xs text-[#9CA3AF]">
                Showing <span className="font-semibold text-[#6B7280]">{filteredStudents.length}</span> of{' '}
                <span className="font-semibold text-[#6B7280]">{students.length}</span> students
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* ADD STUDENT MODAL                                      */}
      {/* ══════════════════════════════════════════════════════ */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Student"
      >
        <StudentFormFields />
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowAddModal(false)}
            className="flex-1 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={formLoading}
            className="flex-1 py-2.5 bg-[#7C3AED] hover:bg-[#5B21B6] disabled:bg-[#C4B5FD] text-white font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            {formLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
              : <><Plus className="w-4 h-4" /> Add Student</>
            }
          </button>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════════════ */}
      {/* EDIT STUDENT MODAL                                     */}
      {/* ══════════════════════════════════════════════════════ */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit — ${selectedStudent?.name}`}
      >
        <StudentFormFields />
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowEditModal(false)}
            className="flex-1 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleEdit}
            disabled={formLoading}
            className="flex-1 py-2.5 bg-[#7C3AED] hover:bg-[#5B21B6] disabled:bg-[#C4B5FD] text-white font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            {formLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              : <><Pencil className="w-4 h-4" /> Save Changes</>
            }
          </button>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════════════ */}
      {/* DELETE CONFIRMATION MODAL                              */}
      {/* ══════════════════════════════════════════════════════ */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Student"
      >
        {/* Warning icon */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-3">
                    <Trash2 className="w-7 h-7 text-red-500" />
                  </div>
                  <p className="font-semibold text-[#1A1A2E] mb-1">Are you sure?</p>
                  <p className="text-xs text-[#6B7280]">
                    This will permanently delete <strong>{selectedStudent?.name}</strong> and all associated data.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={formLoading}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {formLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                      : <><Trash2 className="w-4 h-4" /> Delete</>
                    }
                  </button>
                </div>
              </Modal>
            </Layout>
          )
        }