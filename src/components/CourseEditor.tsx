import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { Course } from '../types';
import { useSchedule } from '../hooks/useSchedule';
import AnimatedList from './animations/AnimatedList';

interface CourseEditorProps {
  course?: Course;
  onClose: () => void;
  isNew?: boolean;
}

const EditorContainer = styled.div`
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  max-height: 90vh;
  margin: 0 auto;
  overflow-y: auto;
  
  /* 美化滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    
    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const EditorTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: rgba(0, 0, 0, 0.8);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(10, 132, 255, 0.2);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(10, 132, 255, 0.2);
  }
`;

const WeeksContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const WeekTag = styled.div<{ isActive: boolean }>`
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  background: ${props => props.isActive ? 'var(--primary-color)' : 'rgba(0, 0, 0, 0.05)'};
  color: ${props => props.isActive ? '#fff' : 'rgba(0, 0, 0, 0.7)'};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.isActive ? 'var(--primary-color)' : 'rgba(0, 0, 0, 0.1)'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  gap: 1rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  border: none;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  background: ${props => {
    switch (props.variant) {
      case 'danger':
        return 'var(--error-color)';
      case 'secondary':
        return 'rgba(0, 0, 0, 0.05)';
      default:
        return 'var(--primary-color)';
    }
  }};
  
  color: ${props => props.variant === 'secondary' ? 'rgba(0, 0, 0, 0.7)' : '#fff'};
  
  &:hover {
    background: ${props => {
      switch (props.variant) {
        case 'danger':
          return '#ff3b30';
        case 'secondary':
          return 'rgba(0, 0, 0, 0.1)';
        default:
          return '#007aff';
      }
    }};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const weekDays = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 7, label: '周日' }
];

const CourseEditor: React.FC<CourseEditorProps> = ({ course, onClose, isNew = false }) => {
  const { addCourse, updateCourse, deleteCourse, addWeekToCourse, removeWeekFromCourse } = useSchedule();
  
  const [formData, setFormData] = useState({
    courseId: '',
    name: '',
    day: 1,
    startSession: 1,
    endSession: 1,
    location: '',
    teacher: '',
    weeks: [] as number[]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 初始化表单数据
  useEffect(() => {
    if (course) {
      setFormData({
        courseId: course.courseId,
        name: course.name,
        day: course.day,
        startSession: course.startSession,
        endSession: course.endSession,
        location: course.location,
        teacher: course.teacher || '',
        weeks: [...course.weeks]
      });
    }
  }, [course]);
  
  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'day' || name === 'startSession' || name === 'endSession' 
        ? parseInt(value) 
        : value
    }));
  };
  
  // 处理周数切换
  const toggleWeek = (week: number) => {
    if (formData.weeks.includes(week)) {
      setFormData(prev => ({
        ...prev,
        weeks: prev.weeks.filter(w => w !== week)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        weeks: [...prev.weeks, week].sort((a, b) => a - b)
      }));
    }
  };
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isNew) {
        // 添加新课程
        await addCourse({
          courseId: formData.courseId,
          name: formData.name,
          day: formData.day,
          startSession: formData.startSession,
          endSession: formData.endSession,
          location: formData.location,
          teacher: formData.teacher,
          weeks: formData.weeks,
          weekRange: `[${formData.weeks.join(',')}周]`
        });
        toast.success('课程添加成功');
      } else if (course) {
        // 更新现有课程
        await updateCourse(course.id, {
          courseId: formData.courseId,
          name: formData.name,
          day: formData.day,
          startSession: formData.startSession,
          endSession: formData.endSession,
          location: formData.location,
          teacher: formData.teacher,
          weeks: formData.weeks,
          weekRange: `[${formData.weeks.join(',')}周]`
        });
        toast.success('课程更新成功');
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save course', error);
      toast.error(isNew ? '添加课程失败' : '更新课程失败');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 处理删除课程
  const handleDelete = async () => {
    if (!course) return;
    
    if (window.confirm('确定要删除这门课程吗？')) {
      setIsSubmitting(true);
      
      try {
        await deleteCourse(course.id);
        toast.success('课程删除成功');
        onClose();
      } catch (error) {
        console.error('Failed to delete course', error);
        toast.error('删除课程失败');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <EditorContainer>
      <EditorHeader>
        <EditorTitle>{isNew ? '添加课程' : '编辑课程'}</EditorTitle>
        <CloseButton onClick={onClose}>&times;</CloseButton>
      </EditorHeader>
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="courseId">课程编号</Label>
          <Input
            type="text"
            id="courseId"
            name="courseId"
            value={formData.courseId}
            onChange={handleInputChange}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="name">课程名称</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="day">星期几</Label>
          <Select
            id="day"
            name="day"
            value={formData.day}
            onChange={handleInputChange}
            required
          >
            {weekDays.map(day => (
              <option key={day.value} value={day.value}>{day.label}</option>
            ))}
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="startSession">开始节次</Label>
          <Select
            id="startSession"
            name="startSession"
            value={formData.startSession}
            onChange={handleInputChange}
            required
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>第{num}节</option>
            ))}
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="endSession">结束节次</Label>
          <Select
            id="endSession"
            name="endSession"
            value={formData.endSession}
            onChange={handleInputChange}
            required
          >
            {Array.from({ length: 12 }, (_, i) => i + 1)
              .filter(num => num >= formData.startSession)
              .map(num => (
                <option key={num} value={num}>第{num}节</option>
              ))
            }
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="location">上课地点</Label>
          <Input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="teacher">任课教师</Label>
          <Input
            type="text"
            id="teacher"
            name="teacher"
            value={formData.teacher}
            onChange={handleInputChange}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>上课周数</Label>
          <AnimatedList>
            <WeeksContainer>
              {Array.from({ length: 20 }, (_, i) => i + 1).map(week => (
                <WeekTag
                  key={week}
                  isActive={formData.weeks.includes(week)}
                  onClick={() => toggleWeek(week)}
                >
                  {week}
                </WeekTag>
              ))}
            </WeeksContainer>
          </AnimatedList>
        </FormGroup>
        
        <ButtonGroup>
          {!isNew && (
            <Button 
              type="button" 
              variant="danger" 
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              删除课程
            </Button>
          )}
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              取消
            </Button>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : '保存'}
            </Button>
          </div>
        </ButtonGroup>
      </Form>
    </EditorContainer>
  );
};

export default CourseEditor; 