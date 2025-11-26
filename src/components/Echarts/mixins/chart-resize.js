import ResizeListener from 'element-resize-detector';

export default {
  data() {
    return {
      isChartUpdating: false,
      chartResizeListener: null,
      isDestroying: false,
      resizeTimer: null,
      updateTimer: null
    };
  },
  methods: {
    setChartUpdating(updating) {
      if (!this.isDestroying) {
        this.isChartUpdating = updating;
      }
    },

    chartEleResizeListener() {
      try {
        this.chartResizeListener = ResizeListener({
          strategy: 'scroll',
          callOnAdd: true
        });
        
        this.chartResizeListener.listenTo(this.$el, () => {
          if (!this.chart || this.isChartUpdating) return;
          
          if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
          }
          
          this.resizeTimer = setTimeout(() => {
            this.safeResize();
          }, 150);
        });
      } catch (e) {
        console.warn('Chart resize listener setup failed:', e);
      }
    },

    safeResize() {
      if (this.isDestroying || !this.chart || this.isChartUpdating) return;
      
      try {
        // 多重安全检查
        if (!this.chart || 
            (typeof this.chart.isDisposed === 'function' && this.chart.isDisposed()) ||
            !this.chart._dom || 
            typeof this.chart.resize !== 'function') {
          return;
        }
        
        this.chart.resize();
      } catch (resizeError) {
        console.warn('ECharts resize failed:', resizeError);
      }
    },

    windowResizeListener() {
      if (!this.chart || this.isChartUpdating) return;
      
      this.$nextTick(() => {
        this.safeResize();
      });
    },

    safeChartUpdate(updateFunction) {
      if (this.isDestroying || !this.chart) return;
      
      if (this.updateTimer) {
        clearTimeout(this.updateTimer);
      }
      
      this.setChartUpdating(true);
      
      this.updateTimer = setTimeout(() => {
        try {
          if (!this.chart || 
              (typeof this.chart.isDisposed === 'function' && this.chart.isDisposed())) {
            return;
          }
          
          updateFunction();
        } catch (e) {
          console.error('Chart update failed:', e);
        } finally {
          this.setChartUpdating(false);
        }
      }, 50);
    },

    reinitChart() {
      if (this.chart) {
        try {
          this.chart.dispose();
        } catch (e) {
          console.warn('Error disposing chart:', e);
        }
      }
      
      this.$nextTick(() => {
        setTimeout(() => {
          if (typeof this.initChart === 'function') {
            this.initChart();
          }
        }, 100);
      });
    }
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.windowResizeListener);
      this.chartEleResizeListener();
    });
  },
  beforeDestroy() {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }
    
    if (this.chartResizeListener && this.$el) {
      try {
        this.chartResizeListener.uninstall(this.$el);
      } catch (e) {
        console.warn('Error uninstalling resize listener:', e);
      }
      this.chartResizeListener = null;
    }
    
    window.removeEventListener('resize', this.windowResizeListener);
    this.isDestroying = true;
  }
};