import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as echarts from 'echarts';
import { useFitness } from '../hooks/useFitness';
import GlassCard from './GlassCard';
import Stack from './Stack';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
`;

const Section = styled(GlassCard)`
  padding: 1.5rem;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 0.5rem 0.25rem;
  flex: 1;
  min-height: 0;
`;

const ChartCard = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(250, 252, 255, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, rgba(10, 132, 255, 0.02), rgba(64, 210, 255, 0.01));
  border-radius: 16px;
  border: 2px dashed rgba(10, 132, 255, 0.15);
  
  .icon {
    font-size: 5rem;
    margin-bottom: 1.5rem;
    filter: drop-shadow(0 4px 8px rgba(10, 132, 255, 0.1));
  }
  
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #0A84FF, #64D2FF);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.05rem;
    color: rgba(0, 0, 0, 0.65);
    line-height: 1.6;
    margin: 0;
  }
`;

const StackWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 280px;
  margin-bottom: 2rem;
  padding: 2rem 0;
  
  @media (max-width: 768px) {
    padding: 1rem 0;
    min-height: 200px;
  }
`;

const ChartStackWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 380px;
  padding: 1rem 1.5rem;
  margin: 0 auto;
  max-width: 100%;
  overflow: visible;
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    min-height: 320px;
  }
`;

const StatCard = styled.div`
  width: 100%;
  height: 100%;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(10, 132, 255, 0.12), rgba(64, 210, 255, 0.08));
  backdrop-filter: blur(10px);
  border-radius: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const StatValue = styled.div`
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #0A84FF, #64D2FF);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.75rem;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.75);
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const StatChange = styled.div<{ isPositive: boolean }>`
  font-size: 1rem;
  color: ${props => props.isPositive ? '#34C759' : '#FF453A'};
  margin-top: 0.75rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  background: ${props => props.isPositive ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 69, 58, 0.1)'};
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  
  &::before {
    content: '${props => props.isPositive ? '↓' : '↑'}';
    font-size: 1.2rem;
  }
`;

const BodyDataCharts: React.FC = () => {
  const { bodyRecords } = useFitness();
  const weightChartRef = useRef<HTMLDivElement>(null);
  const waistlineChartRef = useRef<HTMLDivElement>(null);
  const bodyFatChartRef = useRef<HTMLDivElement>(null);
  const weightChartInstance = useRef<echarts.ECharts | null>(null);
  const waistlineChartInstance = useRef<echarts.ECharts | null>(null);
  const bodyFatChartInstance = useRef<echarts.ECharts | null>(null);
  
  // 响应式卡片尺寸
  const isMobile = window.innerWidth <= 768;
  const chartCardDimensions = isMobile 
    ? { width: 280, height: 260 }
    : { width: 460, height: 330 };

  // 初始化图表
  useEffect(() => {
    if (weightChartRef.current && !weightChartInstance.current) {
      weightChartInstance.current = echarts.init(weightChartRef.current);
    }
    if (waistlineChartRef.current && !waistlineChartInstance.current) {
      waistlineChartInstance.current = echarts.init(waistlineChartRef.current);
    }
    if (bodyFatChartRef.current && !bodyFatChartInstance.current) {
      bodyFatChartInstance.current = echarts.init(bodyFatChartRef.current);
    }

    return () => {
      if (weightChartInstance.current) {
        weightChartInstance.current.dispose();
        weightChartInstance.current = null;
      }
      if (waistlineChartInstance.current) {
        waistlineChartInstance.current.dispose();
        waistlineChartInstance.current = null;
      }
      if (bodyFatChartInstance.current) {
        bodyFatChartInstance.current.dispose();
        bodyFatChartInstance.current = null;
      }
    };
  }, []);

  // 计算统计数据
  const getStats = () => {
    if (bodyRecords.length === 0) return null;

    const sortedRecords = [...bodyRecords].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sortedRecords[sortedRecords.length - 1];
    const first = sortedRecords[0];

    const weightChange = latest.weight && first.weight 
      ? Number((latest.weight - first.weight).toFixed(1))
      : null;
    
    const waistlineChange = latest.waistline && first.waistline
      ? Number((latest.waistline - first.waistline).toFixed(1))
      : null;

    const bodyFatChange = latest.bodyFat && first.bodyFat
      ? Number((latest.bodyFat - first.bodyFat).toFixed(1))
      : null;

    return {
      latest,
      weightChange,
      waistlineChange,
      bodyFatChange
    };
  };

  const stats = getStats();

  // 更新图表数据
  useEffect(() => {
    if (bodyRecords.length === 0) return;

    const sortedRecords = [...bodyRecords].sort((a, b) => a.date.localeCompare(b.date));
    const dates = sortedRecords.map(r => r.date);

    // 体重图表
    if (weightChartInstance.current) {
      const weights = sortedRecords.map(r => r.weight || null);
      const hasData = weights.some(w => w !== null);
      
      if (hasData) {
        const option = {
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: 'rgba(10, 132, 255, 0.2)',
            borderWidth: 1,
            textStyle: {
              fontSize: 15
            },
            formatter: (params: any) => {
              const param = params[0];
              return `${param.name}<br/>体重: <strong>${param.value}</strong> kg`;
            }
          },
          grid: {
            left: '5%',
            right: '5%',
            top: '12%',
            bottom: '18%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: dates,
            boundaryGap: false,
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 0, 0, 0.2)',
                width: 2
              }
            },
            axisLabel: {
              color: 'rgba(0, 0, 0, 0.7)',
              fontSize: 14,
              fontWeight: 500,
              rotate: 30,
              margin: 10
            },
            splitLine: {
              show: false
            }
          },
          yAxis: {
            type: 'value',
            name: 'kg',
            nameTextStyle: {
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: 15,
              fontWeight: 600
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 0, 0, 0.2)',
                width: 2
              }
            },
            axisLabel: {
              color: 'rgba(0, 0, 0, 0.7)',
              fontSize: 14,
              fontWeight: 500
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(0, 0, 0, 0.08)',
                type: 'dashed'
              }
            }
          },
          series: [
            {
              name: '体重',
              type: 'line',
              data: weights,
              smooth: true,
              symbol: 'circle',
              symbolSize: 10,
              lineStyle: {
                color: '#0A84FF',
                width: 5
              },
              itemStyle: {
                color: '#0A84FF',
                borderColor: '#fff',
                borderWidth: 2
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(10, 132, 255, 0.4)' },
                  { offset: 1, color: 'rgba(10, 132, 255, 0.05)' }
                ])
              },
              emphasis: {
                itemStyle: {
                  color: '#0A84FF',
                  borderColor: '#fff',
                  borderWidth: 3,
                  shadowBlur: 10,
                  shadowColor: 'rgba(10, 132, 255, 0.5)'
                }
              }
            }
          ]
        };
        weightChartInstance.current.setOption(option);
      }
    }

    // 腰围图表
    if (waistlineChartInstance.current) {
      const waistlines = sortedRecords.map(r => r.waistline || null);
      const hasData = waistlines.some(w => w !== null);
      
      if (hasData) {
        const option = {
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: 'rgba(255, 149, 0, 0.2)',
            borderWidth: 1,
            textStyle: {
              fontSize: 15
            },
            formatter: (params: any) => {
              const param = params[0];
              return `${param.name}<br/>腰围: <strong>${param.value}</strong> cm`;
            }
          },
          grid: {
            left: '5%',
            right: '5%',
            top: '12%',
            bottom: '18%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: dates,
            boundaryGap: false,
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 0, 0, 0.2)',
                width: 2
              }
            },
            axisLabel: {
              color: 'rgba(0, 0, 0, 0.7)',
              fontSize: 14,
              fontWeight: 500,
              rotate: 30,
              margin: 10
            },
            splitLine: {
              show: false
            }
          },
          yAxis: {
            type: 'value',
            name: 'cm',
            nameTextStyle: {
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: 15,
              fontWeight: 600
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 0, 0, 0.2)',
                width: 2
              }
            },
            axisLabel: {
              color: 'rgba(0, 0, 0, 0.7)',
              fontSize: 14,
              fontWeight: 500
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(0, 0, 0, 0.08)',
                type: 'dashed'
              }
            }
          },
          series: [
            {
              name: '腰围',
              type: 'line',
              data: waistlines,
              smooth: true,
              symbol: 'circle',
              symbolSize: 10,
              lineStyle: {
                color: '#FF9500',
                width: 5
              },
              itemStyle: {
                color: '#FF9500',
                borderColor: '#fff',
                borderWidth: 2
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(255, 149, 0, 0.4)' },
                  { offset: 1, color: 'rgba(255, 149, 0, 0.05)' }
                ])
              },
              emphasis: {
                itemStyle: {
                  color: '#FF9500',
                  borderColor: '#fff',
                  borderWidth: 3,
                  shadowBlur: 10,
                  shadowColor: 'rgba(255, 149, 0, 0.5)'
                }
              }
            }
          ]
        };
        waistlineChartInstance.current.setOption(option);
      }
    }

    // 体脂率图表
    if (bodyFatChartInstance.current) {
      const bodyFats = sortedRecords.map(r => r.bodyFat || null);
      const hasData = bodyFats.some(b => b !== null);
      
      if (hasData) {
        const option = {
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: 'rgba(255, 69, 58, 0.2)',
            borderWidth: 1,
            textStyle: {
              fontSize: 15
            },
            formatter: (params: any) => {
              const param = params[0];
              return `${param.name}<br/>体脂率: <strong>${param.value}</strong> %`;
            }
          },
          grid: {
            left: '5%',
            right: '5%',
            top: '12%',
            bottom: '18%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: dates,
            boundaryGap: false,
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 0, 0, 0.2)',
                width: 2
              }
            },
            axisLabel: {
              color: 'rgba(0, 0, 0, 0.7)',
              fontSize: 14,
              fontWeight: 500,
              rotate: 30,
              margin: 10
            },
            splitLine: {
              show: false
            }
          },
          yAxis: {
            type: 'value',
            name: '%',
            nameTextStyle: {
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: 15,
              fontWeight: 600
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 0, 0, 0.2)',
                width: 2
              }
            },
            axisLabel: {
              color: 'rgba(0, 0, 0, 0.7)',
              fontSize: 14,
              fontWeight: 500
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(0, 0, 0, 0.08)',
                type: 'dashed'
              }
            }
          },
          series: [
            {
              name: '体脂率',
              type: 'line',
              data: bodyFats,
              smooth: true,
              symbol: 'circle',
              symbolSize: 10,
              lineStyle: {
                color: '#FF453A',
                width: 5
              },
              itemStyle: {
                color: '#FF453A',
                borderColor: '#fff',
                borderWidth: 2
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(255, 69, 58, 0.4)' },
                  { offset: 1, color: 'rgba(255, 69, 58, 0.05)' }
                ])
              },
              emphasis: {
                itemStyle: {
                  color: '#FF453A',
                  borderColor: '#fff',
                  borderWidth: 3,
                  shadowBlur: 10,
                  shadowColor: 'rgba(255, 69, 58, 0.5)'
                }
              }
            }
          ]
        };
        bodyFatChartInstance.current.setOption(option);
      }
    }

    // 响应式
    const handleResize = () => {
      weightChartInstance.current?.resize();
      waistlineChartInstance.current?.resize();
      bodyFatChartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [bodyRecords]);

  if (bodyRecords.length === 0) {
    return (
      <Container>
        <Section>
          <EmptyState>
            <div className="icon">📊</div>
            <h3>暂无数据</h3>
            <p>请先在"身体数据"标签页添加记录，然后这里会自动生成趋势图表</p>
          </EmptyState>
        </Section>
      </Container>
    );
  }

  // 准备堆叠卡片数据
  const getStackCards = () => {
    if (!stats) return [];
    
    const cards = [];
    
    if (stats.latest.weight) {
      cards.push({
        id: 'weight',
        content: (
          <StatCard>
            <StatValue>{stats.latest.weight}</StatValue>
            <StatLabel>当前体重 (kg)</StatLabel>
            {stats.weightChange !== null && stats.weightChange !== 0 && (
              <StatChange isPositive={stats.weightChange < 0}>
                {stats.weightChange > 0 ? '+' : ''}{stats.weightChange} kg
              </StatChange>
            )}
          </StatCard>
        )
      });
    }
    
    if (stats.latest.waistline) {
      cards.push({
        id: 'waistline',
        content: (
          <StatCard>
            <StatValue>{stats.latest.waistline}</StatValue>
            <StatLabel>当前腰围 (cm)</StatLabel>
            {stats.waistlineChange !== null && stats.waistlineChange !== 0 && (
              <StatChange isPositive={stats.waistlineChange < 0}>
                {stats.waistlineChange > 0 ? '+' : ''}{stats.waistlineChange} cm
              </StatChange>
            )}
          </StatCard>
        )
      });
    }
    
    if (stats.latest.bodyFat) {
      cards.push({
        id: 'bodyFat',
        content: (
          <StatCard>
            <StatValue>{stats.latest.bodyFat}</StatValue>
            <StatLabel>当前体脂率 (%)</StatLabel>
            {stats.bodyFatChange !== null && stats.bodyFatChange !== 0 && (
              <StatChange isPositive={stats.bodyFatChange < 0}>
                {stats.bodyFatChange > 0 ? '+' : ''}{stats.bodyFatChange} %
              </StatChange>
            )}
          </StatCard>
        )
      });
    }
    
    return cards;
  };

  return (
    <Container>
      {stats && getStackCards().length > 0 && (
        <Section>
          <SectionTitle>📈 数据概览</SectionTitle>
          <div style={{ 
            padding: '0.75rem 1rem', 
            background: 'rgba(10, 132, 255, 0.08)', 
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            color: 'rgba(0, 0, 0, 0.7)',
            textAlign: 'center'
          }}>
            💡 <strong>提示：</strong>可以拖拽卡片查看不同数据，轻扫可切换卡片
          </div>
          <StackWrapper>
            <Stack
              randomRotation={true}
              sensitivity={150}
              sendToBackOnClick={true}
              cardDimensions={{ width: 280, height: 180 }}
              cardsData={getStackCards()}
            />
          </StackWrapper>
        </Section>
      )}

      <Section>
        <SectionTitle>📊 趋势分析</SectionTitle>
        <div style={{ 
          padding: '0.75rem 1rem', 
          background: 'rgba(10, 132, 255, 0.08)', 
          borderRadius: '10px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          color: 'rgba(0, 0, 0, 0.7)',
          textAlign: 'center'
        }}>
          💡 <strong>提示：</strong>拖拽或点击卡片可切换查看不同指标的变化趋势
        </div>
        <ChartStackWrapper>
          <Stack
            randomRotation={false}
            sensitivity={150}
            sendToBackOnClick={true}
            cardDimensions={chartCardDimensions}
            cardsData={[
              {
                id: 'weight-chart',
                content: (
                  <ChartCard>
                    <div style={{ 
                      fontSize: isMobile ? '0.95rem' : '1.05rem', 
                      fontWeight: 600, 
                      color: 'rgba(0, 0, 0, 0.85)',
                      marginBottom: '0.25rem',
                      textAlign: 'center',
                      padding: '0.25rem 0'
                    }}>
                      📊 体重变化趋势
                    </div>
                    <ChartContainer ref={weightChartRef} />
                  </ChartCard>
                )
              },
              {
                id: 'waistline-chart',
                content: (
                  <ChartCard>
                    <div style={{ 
                      fontSize: isMobile ? '0.95rem' : '1.05rem', 
                      fontWeight: 600, 
                      color: 'rgba(0, 0, 0, 0.85)',
                      marginBottom: '0.25rem',
                      textAlign: 'center',
                      padding: '0.25rem 0'
                    }}>
                      📏 腰围变化趋势
                    </div>
                    <ChartContainer ref={waistlineChartRef} />
                  </ChartCard>
                )
              },
              {
                id: 'bodyfat-chart',
                content: (
                  <ChartCard>
                    <div style={{ 
                      fontSize: isMobile ? '0.95rem' : '1.05rem', 
                      fontWeight: 600, 
                      color: 'rgba(0, 0, 0, 0.85)',
                      marginBottom: '0.25rem',
                      textAlign: 'center',
                      padding: '0.25rem 0'
                    }}>
                      💪 体脂率变化趋势
                    </div>
                    <ChartContainer ref={bodyFatChartRef} />
                  </ChartCard>
                )
              }
            ]}
          />
        </ChartStackWrapper>
      </Section>
    </Container>
  );
};

export default BodyDataCharts;

