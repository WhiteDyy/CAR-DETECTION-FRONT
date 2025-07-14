import { defineStore } from 'pinia'

export const useTaskStore = defineStore('task', {
    state: () => ({
        currentTask: null, // 当前任务数据
        taskRecords: []    // 任务记录历史
    }),
    actions: {
        // 设置当前任务
        setCurrentTask(taskData) {
            this.currentTask = taskData
            this.taskRecords.push(taskData)
        },
        // 获取当前任务
        getCurrentTask() {
            return this.currentTask
        },
        // 清除当前任务
        clearCurrentTask() {
            this.currentTask = null
        }
    },
    persist: true // 可选：添加持久化插件
})