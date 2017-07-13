/**
 * Created by xueyingchen.
 */
import { createTask, getTaskList, updateState } from 'API/taskApi'
import { listProgress, createProgress, delProgress } from 'API/projectApi'

import { addNamespace, getIndexByAttr } from '@/util/commonUtil'
const namespace = addNamespace('process')

export const INITDATA = namespace('INITDATA')
export const DELETE = namespace('DELETE')
export const ADDTASK = namespace('ADDTASK')
export const ADDPROCESS = namespace('ADDPROCESS')
export const CHANGEPROCESSNAME = namespace('CHANGEPROCESSNAME')
export const CHANGETASKORDER = namespace('CHANGETASKORDER')
export const DELETEPROCESS = namespace('DELETEPROCESS')
export const CHANGETASKSTATE = namespace('CHANGETASKSTATE')

const MINITDATA = namespace('MINITDATA')
const MADDTASK = namespace('MADDTASK')
const MCHANGETASKSTATE = namespace('CHANGETASKSTATE')

function getProcess (tasks, processes) {
  let result = {}
  processes.forEach(item => {
    result[item.id] = []
  })
  tasks.forEach(item => result[item.progressId].push(item))
  return processes.map(item => Object.assign(item, {
    tasks: result[item.id]
  }))
}

const state = {
  data: []
}

const getters = {}

const actions = {
  [ADDTASK] ({commit, state}, {uid, pid, name}) {
    const idx = getIndexByAttr(pid, state.data, 'id')
    return createTask(name, uid, pid).then(item => {
      commit(MADDTASK, {index: idx, task: item})
    })
  },
  [INITDATA] ({commit}, {pId}) {
    const processList = listProgress(pId)
    const taskList = getTaskList(pId)
    return Promise.all([processList, taskList])
      .then(([{progressList}, {tasks}]) => {
        commit(MINITDATA, getProcess(tasks, progressList))
      })
  },
  [ADDPROCESS] ({commit}, {pName, pid, uid}) {
    return createProgress(pName, pid, uid)
  },
  [DELETEPROCESS] ({commit}, {pid, uid}) {
    return delProgress(pid, uid)
  },
  [CHANGETASKSTATE] ({commit}, {taskId, userId, checked, pIndex, tIndex}) {
    return updateState(taskId, userId, checked)
      .then(_ => commit(MCHANGETASKSTATE, {pIndex, tIndex, checked}))
  }
}

const mutations = {
  [DELETE] (state, index) {
    state.data.splice(index, 1)
  },
  [CHANGEPROCESSNAME] (state, index, name) {
    state.data[index].name = name
  },
  [MINITDATA] (state, data) {
    state.data = data
  },
  [MADDTASK] (state, {index, task}) {
    state.data[index].tasks.push(task)
  },
  [CHANGETASKORDER] (state, {index, value}) {
    state.data[index].tasks = value
  },
  [MCHANGETASKSTATE] (state, {pIndex, tIndex, checked}) {
    state.data[pIndex].tasks[tIndex].state = checked
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
