import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Icon from './Icon';

const DatePickerContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DateInput = styled.div<{ isFocused: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid ${props => props.isFocused ? 'rgba(10, 132, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 12px;
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    background: rgba(255, 255, 255, 0.6);
    border-color: rgba(10, 132, 255, 0.3);
  }
`;

const DateDisplay = styled.span`
  flex: 1;
  color: ${props => props.theme.hasValue ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.4)'};
`;

const CalendarIcon = styled.div`
  font-size: 1.2rem;
  color: rgba(10, 132, 255, 0.8);
`;

const CalendarDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(250, 252, 255, 0.9));
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  padding: 1rem;
  z-index: 9999;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.3s ease;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(10, 132, 255, 0.1);
`;

const MonthYearDisplay = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
`;

const NavButton = styled.button.attrs({ type: 'button' })`
  background: rgba(10, 132, 255, 0.1);
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(10, 132, 255, 0.9);
  font-size: 1.2rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(10, 132, 255, 0.2);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const WeekDays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const WeekDay = styled.div`
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
  padding: 0.5rem 0;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
`;

const DayCell = styled.button.attrs({ type: 'button' })<{ isToday: boolean; isSelected: boolean; isOtherMonth: boolean }>`
  background: ${props => 
    props.isSelected ? 'rgba(10, 132, 255, 0.8)' : 
    props.isToday ? 'rgba(10, 132, 255, 0.15)' : 
    'transparent'};
  border: ${props => props.isToday && !props.isSelected ? '2px solid rgba(10, 132, 255, 0.5)' : 'none'};
  border-radius: 10px;
  padding: 0.6rem;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: ${props => props.isSelected || props.isToday ? '600' : '400'};
  color: ${props => 
    props.isSelected ? 'white' : 
    props.isOtherMonth ? 'rgba(0, 0, 0, 0.3)' : 
    'rgba(0, 0, 0, 0.85)'};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.isSelected ? 'rgba(10, 132, 255, 0.9)' : 'rgba(10, 132, 255, 0.15)'};
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const CalendarFooter = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 2px solid rgba(10, 132, 255, 0.1);
`;

const FooterButton = styled.button.attrs({ type: 'button' })<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.6rem 1rem;
  background: ${props => props.variant === 'primary' ? 'rgba(10, 132, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)'};
  color: ${props => props.variant === 'primary' ? 'white' : 'rgba(0, 0, 0, 0.7)'};
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.variant === 'primary' ? 'rgba(10, 132, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder = '请选择日期' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 解析日期字符串
  const selectedDate = value ? new Date(value) : null;
  
  // 格式化显示的日期
  const formatDate = (date: Date | null) => {
    if (!date) return placeholder;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[date.getDay()];
    return `${year}年${month}月${day}日 (${weekDay})`;
  };
  
  // 获取当月的所有日期
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Array<{ date: Date; isOtherMonth: boolean }> = [];
    
    // 添加上个月的日期
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isOtherMonth: true
      });
    }
    
    // 添加当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isOtherMonth: false
      });
    }
    
    // 添加下个月的日期
    const remainingDays = 42 - days.length; // 6周 x 7天
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isOtherMonth: true
      });
    }
    
    return days;
  };
  
  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleDateSelect = (date: Date, isOtherMonth: boolean) => {
    // 如果点击的是其他月份的日期，只切换月份，不选择日期
    if (isOtherMonth) {
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      return;
    }
    
    // 选择当前月份的日期
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    onChange(`${year}-${month}-${day}`);
    setIsOpen(false);
    setIsFocused(false);
  };
  
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    handleDateSelect(today, false);
  };
  
  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    setIsFocused(false);
  };
  
  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };
  
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };
  
  return (
    <DatePickerContainer ref={containerRef}>
      <DateInput
        isFocused={isFocused}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsFocused(!isOpen);
          if (selectedDate) {
            setCurrentMonth(selectedDate);
          }
        }}
      >
        <DateDisplay theme={{ hasValue: !!value }}>
          {formatDate(selectedDate)}
        </DateDisplay>
        <CalendarIcon>
          <Icon name="calendar" />
        </CalendarIcon>
      </DateInput>
      
      <CalendarDropdown isOpen={isOpen}>
        <CalendarHeader>
          <NavButton onClick={handlePrevMonth}>
            <Icon name="chevron-left" />
          </NavButton>
          <MonthYearDisplay>
            {currentMonth.getFullYear()}年{(currentMonth.getMonth() + 1).toString().padStart(2, '0')}月
          </MonthYearDisplay>
          <NavButton onClick={handleNextMonth}>
            <Icon name="chevron-right" />
          </NavButton>
        </CalendarHeader>
        
        <WeekDays>
          {['日', '一', '二', '三', '四', '五', '六'].map(day => (
            <WeekDay key={day}>{day}</WeekDay>
          ))}
        </WeekDays>
        
        <DaysGrid>
          {days.map((day, index) => (
            <DayCell
              key={index}
              isToday={isToday(day.date)}
              isSelected={isDateSelected(day.date)}
              isOtherMonth={day.isOtherMonth}
              onClick={() => handleDateSelect(day.date, day.isOtherMonth)}
            >
              {day.date.getDate()}
            </DayCell>
          ))}
        </DaysGrid>
        
        <CalendarFooter>
          <FooterButton onClick={handleClear}>
            清除
          </FooterButton>
          <FooterButton variant="primary" onClick={handleToday}>
            今天
          </FooterButton>
        </CalendarFooter>
      </CalendarDropdown>
    </DatePickerContainer>
  );
};

export default DatePicker;

