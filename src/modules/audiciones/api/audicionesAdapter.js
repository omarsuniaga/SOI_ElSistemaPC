import * as mock from './mocks/audicionesMock.js'
import * as real from './audicionesSupabase.js'

const impl = import.meta.env.VITE_USE_MOCK === 'true' ? mock : real

export default {
  getCurrentUser:         impl.getCurrentUser,
  getSections:            impl.getSections,
  getRepertoire:          impl.getRepertoire,
  getAssignedStudents:    impl.getAssignedStudents,
  getEvaluationsByJurado: impl.getEvaluationsByJurado,
  saveEvaluation:         impl.saveEvaluation,
  getStudentResults:      impl.getStudentResults,
  getAllEvaluations:      impl.getAllEvaluations,
}
