<template>
  <div>
    <el-dialog v-el-drag-dialog title="此操作将永久删除该资源及以下权限, 是否继续?" @close="cancelOperate()" :visible.sync="formVisible" width="50%" custom-class="dialog-default">
        <div class="dialog-contant-default" style="text-align:left;">
          <ul style="list-style:none">
            <li v-for="(value,index) in paramData" v-bind:key="index">
              {{ value }}
            </li>
          </ul>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button @click="formVisible = false">取消</el-button>
            <el-button type="primary" @click="saveOperate">确定</el-button>
        </div>
      </el-dialog>
  </div>  
</template>
<script>
import elDragDialog from '@/directive/el-dragDialog'
export default {
  directives: { elDragDialog },
  name: 'sourceManageDialog',
  components: {
  },
  mounted() {
  },
  created() {
  },
  data() {
    return {
      formVisible: false
    }
  },
  props: {
    paramData: Array
  },
  methods: {
    openDialog() {
      this.formVisible = true
    },
    saveOperate() {
      this.$emit('deleteOperator')
      this.formVisible = false // 关闭弹窗 会触发 取消保存(cancelOperate) 事件
    },
    cancelOperate() { // 取消保存
      this.formVisible = false
    }
  },
  watch: {
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
</style>
