import React from 'react';
import Select from 'react-select';

const styles = {
  container: (base) => ({ ...base, width: '100%', minWidth: 0 }),
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    borderRadius: 12,
    border: `1.5px solid ${state.isFocused ? '#a855f7' : '#e9d5ff'}`,
    boxShadow: state.isFocused ? '0 0 0 3px rgba(168,85,247,.25)' : 'none',
    background: state.isDisabled ? '#f1eef9' : '#fbf9ff',
    cursor: 'pointer',
  }),
  valueContainer: (base) => ({ ...base, padding: '4px 10px' }),
  singleValue: (base) => ({ ...base, color: '#4a3e71', fontWeight: 600 }),
  placeholder: (base) => ({ ...base, color: '#8a78c7', fontWeight: 600 }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, color: '#6e57d1' }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({
    ...base,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid #e8e1ff',
    boxShadow: '0 12px 28px rgba(91,59,138,.15)',
    backdropFilter: 'blur(3px)',
  }),
  menuList: (base) => ({ ...base, padding: 6, maxHeight: 220 }),
  option: (base, state) => ({
    ...base,
    borderRadius: 10,
    padding: '10px 12px',
    margin: '2px 0',
    background: state.isSelected
      ? 'linear-gradient(135deg,#7c3aed,#a855f7)'
      : state.isFocused
      ? '#f3ecff'
      : '#fff',
    color: state.isSelected ? '#fff' : '#4a3e71',
    fontWeight: state.isSelected ? 700 : 600,
    cursor: 'pointer',
  }),
};

export default function SelectMorado({
  options,
  value,
  onChange,
  placeholder = 'Seleccione…',
  isDisabled = false,
  isClearable = false,
  isSearchable = true,
  instanceId,
}) {
  return (
    <Select
      classNamePrefix="select-morado"
      instanceId={instanceId}
      styles={styles}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isClearable={isClearable}
      isSearchable={isSearchable}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPosition="fixed"
    />
  );
}
