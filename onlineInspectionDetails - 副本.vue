<template>
  <div class="container p-12">
    <div class="inspection-detail p-12">
      <div class="inspection-detail-info">
        <h2 class="font-16 mb-3">
          {{ state.onlineInspectionDetails.employeeName }}
        </h2>
        <p class="mb-12">
          {{ state.onlineInspectionDetails.employeeOrganization }}·{{ state.onlineInspectionDetails.employeeJob }}
        </p>
      </div>
      <div class="inspection-detail-info">
        <h2>
          <b>{{ state.onlineInspectionDetails.shopCode }}</b>
          {{ state.onlineInspectionDetails.shopName }}
        </h2>
        <p class="mt-8 mb-8">
          {{ state.onlineInspectionDetails.regionName }}{{ state.onlineInspectionDetails.shopAddress }}
        </p>
        <span>{{ $t($t($t('时间'))) }}：{{ state.onlineInspectionDetails.auditTime }}</span>
        <span>{{ $t($t($t('时长'))) }}：{{ state.onlineInspectionDetails.auditDuration }}</span>
      </div>
    </div>
    <div class="inspection-detail p-12 mt-12">
      <div class="inspection-detail-info">
        <h3 class="font-12">
          {{ $t($t($t('巡查得分'))) }}
          <b class="font-32 mb-4">{{ state.onlineInspectionDetails.auditSource }}</b>
        </h3>
        <span class="mt-8">
          <i>{{ $t($t($t('总分'))) }}{{ state.onlineInspectionDetails.totalAuditSource }}</i>
          <i>{{ $t($t($t('检查问题数'))) }}{{ state.onlineInspectionDetails.totalProjectCount }}</i>
          <i>{{ $t($t($t('不合格'))) }}{{ state.onlineInspectionDetails.noQualifyProjectCount }}</i>
        </span>
      </div>
      <div class="inspection-detail-info border">
        <h2>
          {{ $t($t($t('巡查意见'))) }}
        </h2>
        <div class="note mt-4 font-12">
          {{ state.onlineInspectionDetails.auditAdvice }}
        </div>
      </div>
    </div>
    <div class="question-list">
      <h2 class="font-16 mt-24 mb-12">
        {{ $t($t($t('问题项'))) }}
      </h2>
      <div
        v-for="item in state.onlineInspectionDetails && state.onlineInspectionDetails.workOrderProjectVoList"
        :key="item.workOrderProjectId"
        class="question-list-item p-12"
      >
        <div class="total-num flex font-12">
          <p>
            <span>{{ $t($t($t('总分'))) }}{{ item.totalSource }}</span>
            ｜
            <span>{{ $t($t($t('扣分'))) }}{{ item.deductSource && item.deductSource.replace('-', '') }}</span>
          </p>
          <label class="flex question-status">{{ item.rectificationStatus }}</label>
        </div>
        <div class="detail">
          <h2 class="mt-12">
            {{ item.projectName }}
          </h2>
          <label class="mt-4 mb-12" for="">{{ item.oneLevelClassify }} · {{ item.twoLevelClassify }}</label>
          <p>{{ $t($t($t('巡查评语'))) }}：{{ item.auditAdvice }}</p>
          <div class="detail-label mt-12">
            <p>
              <label for="">{{ $t($t($t('要求整改时间'))) }}</label>
              <span>{{ item.askRectificationTime }}</span>
            </p>
            <p>
              <label for="">{{ $t($t($t('抄送人'))) }}</label>
              <span>{{ item.ccEmployeeName }}</span>
            </p>
            <template v-if="item.isExpand">
              <p>
                <label for="">{{ $t($t($t('指派整改人'))) }}</label>
                <span>{{ item.askRectificationEmployeeName }}</span>
              </p>
              <p>
                <label for="">{{ $t($t($t('实际整改人'))) }}</label>
                <span>{{ item.realityRectificationEmployeeName }}</span>
              </p>
              <p>
                <label for="">{{ $t($t($t('整改说明'))) }}</label>
                <span>{{ item.rectificationRemark }}</span>
              </p>
              <p>
                <label for="">{{ $t($t($t('实际整改时间'))) }}</label>
                <span>{{ item.rectificationTime }}</span>
              </p>
              <p>
                <label for="">{{ $t($t($t('是否超期整改'))) }}</label>
                <span>{{ item.rectificationTimeoutMark }}</span>
              </p>
              <p>
                <label for="">{{ $t($t($t('一级指派审核人'))) }}</label>
                <span>{{ item.oneLevelAskCheckEmployeeName }}</span>
              </p>
              <p>
                <label for="">{{ $t($t($t('一级实际审核人'))) }}</label>
                <span>{{ item.oneLevelRealityCheckEmployeeName }}</span>
              </p>
              <p>
                <label for="">{{ $t($t($t('一级审核时间'))) }}</label>
                <span>{{ item.oneLevelCheckTime }}</span>
              </p>
              <p>
                <label for="">{{ $t($t($t('一级审核意见'))) }}</label>
                <span>{{ item.oneLevelCheckAdvice }}</span>
              </p>
              <p>
                <label for="">{{ $t($t($t('完成问题单耗时'))) }}</label>
                <span>{{ item.rectificationDuration }}</span>
              </p>
            </template>
            <div class="more flex mt-16" @click="item.isExpand = !item.isExpand">
              <span>{{ !item.isExpand ? $t($t('查看')) : $t($t('收起')) }}{{ $t($t($t('更多'))) }}</span>
              <i :class="['iconfont', 'icon-down', { up: item.isExpand }]"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { reactive, ref, toRefs, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { auditGet } from '@/httpApi/coverageRate'

const route = useRoute()
const { workOrderId } = route.query
const showLoading = ref(true)
const state = reactive({
  onlineInspectionDetails: {}
})
// 添加滚动事件
const container = ref(null)
onMounted(() => {
  document.addEventListener('scroll', container)
  getAuditGet()
})

// 获取线上巡检详情数据
const getAuditGet = () => {
  showLoading.value = true
  auditGet({ workOrderId }).then(res => {
    console.log(res)
    state.onlineInspectionDetails = res || {}
    showLoading.value = false
  })
}
</script>
<style lang="less" scoped>
.container {
  .inspection-detail {
    background: #fff;
    border-radius: 2px;

    &-info {
      &:first-child {
        border-bottom: 0.5px solid #f8fafd;
        margin-bottom: 12px;
      }

      b {
        font-size: 16px;
        margin-right: 4px;
      }

      h3 {
        font-weight: 400;

        b {
          font-size: 32px;
          margin-left: 4px;
        }
      }

      p {
        font-size: 12px;
        color: #5a6073;
      }

      span {
        display: block;
        color: #9ea5bb;
        font-size: 12px;
        margin-top: 4px;

        i {
          margin-right: 12px;
        }
      }

      span.mt-8 {
        margin-top: 8px;
      }

      &.border {
        border-top: 0.5px solid #e8ebf3;
        padding-top: 12px;
      }

      .note {
        line-height: 18px;
      }
    }
  }

  .question-list {
    &-item {
      background: #fff;

      .total-num {
        display: flex;

        p {
          display: inline-block;
          border-radius: 2px;
          border: 1px solid #fc3f41;
          color: #fc3f41;
          padding: 2px 4px;
        }

        .question-status {
          padding: 2px 8px;
          border-radius: 2px;
          background: #fff7e1;
          color: #ff6600;
          // &._0 {
          //   background: #FFF8F8;
          //   color: #FC3F41;
          // }

          // &._1 {
          //   background: #FFF7E1;
          //   color: #FF6600;
          // }

          // &._2 {
          //   background: #F2F2F7;
          //   color: #B0B9CB;
          // }
        }
      }

      .detail {
        > label {
          display: inline-block;
          font-size: 12px;
          color: #9ea5bb;
        }

        .detail-label {
          border-radius: 4px;
          border: 0.5px solid #e8ebf3;
          color: #5a6073;
          padding: 16px 12px;

          p {
            &:not(:last-child) {
              margin-bottom: 8px;
            }

            label {
              display: inline-block;
              width: 110px;
              margin-right: 8px;
            }
          }

          .more {
            justify-content: center;
            color: #5a6073;
            cursor: pointer;

            i {
              font-size: 14px;
              margin-left: 4px;
              color: #9ea5bb;

              &.up {
                transform: rotate(180deg);
              }
            }
          }
        }
      }
    }
  }
}
</style>
