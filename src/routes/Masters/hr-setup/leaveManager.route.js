const express = require('express')
const LeaveManagerRouter = express.Router()
const { leaveManagerController } = require('../../../controllers/index')
const { handleToken } = require('../../../utils/handleToken')


LeaveManagerRouter.post('/', handleToken, leaveManagerController.createLeaveManager)
LeaveManagerRouter.get('/', handleToken, leaveManagerController.getAllLeaveManagers)
LeaveManagerRouter.put('/:id', handleToken, leaveManagerController.updateLeaveManager)
LeaveManagerRouter.delete('/delete/:id',handleToken, leaveManagerController.deleteLeaveManager)

module.exports = LeaveManagerRouter
