<template>
  <div>
    <el-dialog v-el-drag-dialog title="编辑" @close="cancelOperate()" :visible.sync="formVisible" width="50%" custom-class="dialog-default">
        <el-form ref="updateFrom" style="padding:30px" label-position="left" label-width="120px">
            <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="任务名称:">
                    <el-input ref="currentFocus" size="mini" v-model="obj.title"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="任务分类：">
                    <el-select v-model="obj.taskType" placeholder="" style="width:100%">
                      <el-option v-for="item in taskTypeOptions" :key="item.value" :label="item.label" :value="item.value">
                      </el-option>
                   </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="任务描述:">
                    <el-input size="mini" v-model="obj.subtitle"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="serverID：">
                    <el-input size="mini" v-model="obj.serverID"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
             <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="加载方式:">
                    <el-input size="mini" v-model="obj.serverID"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="时间粒度：">
                    <el-input size="mini" v-model="obj.serverID"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
               <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="是否有效:">
                    <el-input size="mini" v-model="obj.serverID"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="是否有子任务：">
                    <el-input size="mini" v-model="obj.serverID"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
               <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="参数1:">
                    <el-input size="mini" v-model="obj.serverID"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="子任务加载：">
                    <el-input size="mini" v-model="obj.serverID"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="参数2:">
                    <el-input size="mini" v-model="obj.serverID"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="前置任务:">
                    <el-input size="mini" v-model="obj.serverID"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="formVisible = false">取消</el-button>
            <el-button type="primary" @click="saveOperate">保存</el-button>
        </div>
      </el-dialog>
  </div>  
</template>
<script>
import elDragDialog from '@/directive/el-dragDialog'
export default {
  directives: { elDragDialog },
  name: 'taskConfigurationDialog',
  components: {
  },
  mounted() {
  },
  created() {
  },
  data() {
    return {
      formVisible: false,
      obj: {}, // 复制一份显示数据
      taskTypeOptions: [{ label: '归档系统', value: '归档系统' }, { label: 'EAST系统', value: 'EAST系统' }, { label: '应用中心', value: '应用中心' }]
    }
  },
  props: {
    param: {
      obj: {
        title: String,
        subtitle: String,
        serverID: String,
        taskType: String
      },
      isAdd: Boolean // 是否是添加
    }
  },
  methods: {
    openDialog() {
      this.obj = JSON.parse(JSON.stringify(this.param.obj))
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.currentFocus.focus()
      })
    },
    saveOperate() {
      if (this.param.isAdd) {
        if (this.obj.title && this.obj.title.length !== 0) {
          this.param.isAdd = false
          this.$emit('update-value', this.obj)
        }
      } else {
        if (this.obj.title.length === 0) {
          this.$message({ type: 'error', message: '任务名称不能为空' })
          return false
        }
        this.$emit('update-value', this.obj) // 触发父组件的 update事件
      }
      this.formVisible = false // 关闭弹窗 会触发 取消保存(cancelOperate) 事件
    },
    cancelOperate() { // 取消保存
      if (this.param.isAdd) {
        this.param.isAdd = false
        this.$emit('delete-node') // 移除 当前节点
      }
    }
  },
  watch: {
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
</style>
