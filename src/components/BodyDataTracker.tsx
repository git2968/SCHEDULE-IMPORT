import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useFitness } from '../hooks/useFitness';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import GlassInput from './GlassInput';
import DatePicker from './DatePicker';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Section = styled(GlassCard)`
  padding: 1.5rem;
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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
`;

const RecordsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(10, 132, 255, 0.3);
    border-radius: 3px;
    
    &:hover {
      background: rgba(10, 132, 255, 0.5);
    }
  }
`;

const RecordItem = styled.div`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(10, 132, 255, 0.1);
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.8);
    border-color: rgba(10, 132, 255, 0.3);
    transform: translateX(3px);
  }
`;

const RecordHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const RecordDate = styled.div`
  font-weight: 600;
  color: rgba(10, 132, 255, 0.9);
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 69, 58, 0.8);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 69, 58, 0.1);
    color: rgba(255, 69, 58, 1);
  }
`;

const RecordData = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.7);
`;

const DataItem = styled.div`
  strong {
    color: rgba(0, 0, 0, 0.85);
  }
`;

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const BodyDataTracker: React.FC = () => {
  const { bodyRecords, addBodyRecord, deleteBodyRecord } = useFitness();
  const [showMoreFields, setShowMoreFields] = useState(false);

  const [formData, setFormData] = useState({
    date: getTodayString(),
    weight: '',
    waistline: '',
    hipline: '',
    chest: '',
    arm: '',
    thigh: '',
    bodyFat: '',
    muscleMass: '',
    note: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 检查是否至少输入了一个数据
    const hasData = formData.weight || formData.waistline || formData.hipline || 
                    formData.chest || formData.arm || formData.thigh || 
                    formData.bodyFat || formData.muscleMass;

    if (!hasData) {
      toast.error('请至少输入一项身体数据');
      return;
    }

    try {
      await addBodyRecord({
        date: formData.date,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        waistline: formData.waistline ? parseFloat(formData.waistline) : undefined,
        hipline: formData.hipline ? parseFloat(formData.hipline) : undefined,
        chest: formData.chest ? parseFloat(formData.chest) : undefined,
        arm: formData.arm ? parseFloat(formData.arm) : undefined,
        thigh: formData.thigh ? parseFloat(formData.thigh) : undefined,
        bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : undefined,
        muscleMass: formData.muscleMass ? parseFloat(formData.muscleMass) : undefined,
        note: formData.note
      });

      toast.success('记录添加成功');
      
      // 重置表单
      setFormData({
        date: getTodayString(),
        weight: '',
        waistline: '',
        hipline: '',
        chest: '',
        arm: '',
        thigh: '',
        bodyFat: '',
        muscleMass: '',
        note: ''
      });
    } catch (error) {
      toast.error('添加记录失败');
    }
  };

  const handleDelete = async (recordId: string) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      try {
        await deleteBodyRecord(recordId);
        toast.success('记录已删除');
      } catch (error) {
        toast.error('删除记录失败');
      }
    }
  };

  return (
    <Container>
      <Section>
        <SectionTitle>📝 记录身体数据</SectionTitle>
        <div style={{ 
          padding: '0.75rem 1rem', 
          background: 'rgba(10, 132, 255, 0.08)', 
          borderRadius: '10px',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          color: 'rgba(0, 0, 0, 0.7)'
        }}>
          💡 <strong>温馨提示：</strong>只需填写你关心的指标即可，如有需要可点击"展开更多指标"
        </div>
        <form onSubmit={handleSubmit}>
          <FormGroup style={{ marginBottom: '1rem' }}>
            <Label>日期</Label>
            <DatePicker
              value={formData.date}
              onChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
              placeholder="选择日期"
            />
          </FormGroup>

          <FormGrid>
            <FormGroup>
              <Label>体重 (kg)</Label>
              <GlassInput
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="例如: 70.5"
                step="any"
              />
            </FormGroup>

            <FormGroup>
              <Label>腰围 (cm)</Label>
              <GlassInput
                type="number"
                name="waistline"
                value={formData.waistline}
                onChange={handleInputChange}
                placeholder="例如: 83"
                step="any"
              />
            </FormGroup>

            <FormGroup>
              <Label>体脂率 (%)</Label>
              <GlassInput
                type="number"
                name="bodyFat"
                value={formData.bodyFat}
                onChange={handleInputChange}
                placeholder="例如: 20"
                step="any"
              />
            </FormGroup>
          </FormGrid>

          <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setShowMoreFields(!showMoreFields)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(10, 132, 255, 0.9)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              {showMoreFields ? '▼' : '▶'} {showMoreFields ? '收起更多指标' : '展开更多指标'}
            </button>
          </div>

          {showMoreFields && (
            <FormGrid>
              <FormGroup>
                <Label>臀围 (cm)</Label>
                <GlassInput
                  type="number"
                  name="hipline"
                  value={formData.hipline}
                  onChange={handleInputChange}
                  placeholder="例如: 95"
                  step="any"
                />
              </FormGroup>

              <FormGroup>
                <Label>胸围 (cm)</Label>
                <GlassInput
                  type="number"
                  name="chest"
                  value={formData.chest}
                  onChange={handleInputChange}
                  placeholder="例如: 90"
                  step="any"
                />
              </FormGroup>

              <FormGroup>
                <Label>臂围 (cm)</Label>
                <GlassInput
                  type="number"
                  name="arm"
                  value={formData.arm}
                  onChange={handleInputChange}
                  placeholder="例如: 30"
                  step="any"
                />
              </FormGroup>

              <FormGroup>
                <Label>腿围 (cm)</Label>
                <GlassInput
                  type="number"
                  name="thigh"
                  value={formData.thigh}
                  onChange={handleInputChange}
                  placeholder="例如: 55"
                  step="any"
                />
              </FormGroup>

              <FormGroup>
                <Label>肌肉量 (kg)</Label>
                <GlassInput
                  type="number"
                  name="muscleMass"
                  value={formData.muscleMass}
                  onChange={handleInputChange}
                  placeholder="例如: 50"
                  step="any"
                />
              </FormGroup>
            </FormGrid>
          )}

          <FormGroup style={{ marginTop: '1rem' }}>
            <Label>备注（可选）</Label>
            <GlassInput
              as="textarea"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              placeholder="记录当天的感受或备注..."
              rows={3}
            />
          </FormGroup>

          <GlassButton 
            type="submit" 
            style={{ 
              marginTop: '1rem',
              width: '100%',
              padding: '0.875rem',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            💾 添加记录
          </GlassButton>
        </form>
      </Section>

      {bodyRecords.length > 0 && (
        <>
          <Section>
            <SectionTitle>📋 最近记录</SectionTitle>
            <RecordsList>
              {[...bodyRecords]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map(record => (
                  <RecordItem key={record.id}>
                    <RecordHeader>
                      <RecordDate>{record.date}</RecordDate>
                      <DeleteButton onClick={() => handleDelete(record.id)}>
                        删除
                      </DeleteButton>
                    </RecordHeader>
                    <RecordData>
                      {record.weight && <DataItem><strong>体重:</strong> {Number(record.weight) % 1 === 0 ? Math.round(record.weight) : record.weight}kg</DataItem>}
                      {record.waistline && <DataItem><strong>腰围:</strong> {Number(record.waistline) % 1 === 0 ? Math.round(record.waistline) : record.waistline}cm</DataItem>}
                      {record.hipline && <DataItem><strong>臀围:</strong> {Number(record.hipline) % 1 === 0 ? Math.round(record.hipline) : record.hipline}cm</DataItem>}
                      {record.chest && <DataItem><strong>胸围:</strong> {Number(record.chest) % 1 === 0 ? Math.round(record.chest) : record.chest}cm</DataItem>}
                      {record.arm && <DataItem><strong>臂围:</strong> {Number(record.arm) % 1 === 0 ? Math.round(record.arm) : record.arm}cm</DataItem>}
                      {record.thigh && <DataItem><strong>腿围:</strong> {Number(record.thigh) % 1 === 0 ? Math.round(record.thigh) : record.thigh}cm</DataItem>}
                      {record.bodyFat && <DataItem><strong>体脂率:</strong> {Number(record.bodyFat) % 1 === 0 ? Math.round(record.bodyFat) : record.bodyFat}%</DataItem>}
                      {record.muscleMass && <DataItem><strong>肌肉量:</strong> {Number(record.muscleMass) % 1 === 0 ? Math.round(record.muscleMass) : record.muscleMass}kg</DataItem>}
                    </RecordData>
                    {record.note && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                        备注: {record.note}
                      </div>
                    )}
                  </RecordItem>
                ))}
            </RecordsList>
          </Section>
        </>
      )}
    </Container>
  );
};

export default BodyDataTracker;

