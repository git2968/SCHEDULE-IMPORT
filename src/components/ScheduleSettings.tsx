import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useSchedule } from '../hooks/useSchedule';
import GlassButton from './GlassButton';
import GlassInput from './GlassInput';

const SettingsContainer = styled.div`
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

const FormActions = styled.div`
  margin-top: 1.5rem;
`;

const ScheduleSettings: React.FC = () => {
  const { currentSchedule, updateSchedule } = useSchedule();
  
  const [scheduleName, setScheduleName] = useState(currentSchedule?.name || '');
  const [totalWeeks, setTotalWeeks] = useState(currentSchedule?.totalWeeks.toString() || '20');
  const [saving, setSaving] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scheduleName.trim()) {
      toast.error('请输入课表名称');
      return;
    }
    
    const parsedTotalWeeks = parseInt(totalWeeks, 10);
    if (isNaN(parsedTotalWeeks) || parsedTotalWeeks < 1 || parsedTotalWeeks > 30) {
      toast.error('总周数应为1-30之间的整数');
      return;
    }
    
    try {
      setSaving(true);
      
      await updateSchedule({
        name: scheduleName.trim(),
        totalWeeks: parsedTotalWeeks
      });
      
      toast.success('课表设置已保存');
    } catch (error) {
      console.error('Failed to save schedule settings', error);
      toast.error('保存设置失败');
    } finally {
      setSaving(false);
    }
  };
  
  if (!currentSchedule) {
    return <p>请先导入课表</p>;
  }
  
  return (
    <SettingsContainer>
      <h3>课表设置</h3>
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <FormLabel htmlFor="scheduleName">课表名称</FormLabel>
          <GlassInput
            id="scheduleName"
            type="text"
            value={scheduleName}
            onChange={(e) => setScheduleName(e.target.value)}
            placeholder="请输入课表名称"
            required
            fullWidth
          />
        </FormGroup>
        
        <FormGroup>
          <FormLabel htmlFor="totalWeeks">总周数</FormLabel>
          <GlassInput
            id="totalWeeks"
            type="number"
            min="1"
            max="30"
            value={totalWeeks}
            onChange={(e) => setTotalWeeks(e.target.value)}
            placeholder="请输入总周数"
            required
            fullWidth
          />
        </FormGroup>
        
        <FormActions>
          <GlassButton
            type="submit"
            disabled={saving}
          >
            {saving ? '保存中...' : '保存设置'}
          </GlassButton>
        </FormActions>
      </form>
    </SettingsContainer>
  );
};

export default ScheduleSettings; 