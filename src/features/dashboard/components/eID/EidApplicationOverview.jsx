import React from 'react';
import { FaPlus, FaClock, FaPrint, FaTimesCircle } from 'react-icons/fa';

export default function EidApplicationOverview({ stats }) {
  const {
    new_apps = 0,
    pending_review = 0,
    ready_printing = 0,
    rejected = 0,
  } = stats || {};

  const items = [
    {
      label: 'New Application',
      value: new_apps,
      icon: FaPlus,
      containerClass: 'bg-[#E6F4E6] border-[#B7DDB8]',
      iconBgClass: 'text-[#2F7A37]',
      textClass: 'text-[#005F02]',
    },
    {
      label: 'Pending Review',
      value: pending_review,
      icon: FaClock,
      containerClass: 'bg-[#FFF4D6] border-[#E6C36A]',
      iconBgClass: 'text-[#D9A441]',
      textClass: 'text-[#C58F00]',
    },
    {
      label: 'Ready For Printing',
      value: ready_printing,
      icon: FaPrint,
      containerClass: 'bg-[#E1F5FE] border-[#B3E5FC]',
      iconBgClass: 'text-[#0288D1]',
      textClass: 'text-[#01579B]',
    },
    {
      label: 'Rejected',
      value: rejected,
      icon: FaTimesCircle,
      containerClass: 'bg-[#FDE8E7] border-[#E39A95]',
      iconBgClass: 'text-[#C43C3C]',
      textClass: 'text-[#B3261E]',
    },
  ];

  return (
    <section className="mb-6">
      <div className="bg-white rounded-2xl border border-[#CFE8CF] px-4 py-3">
        <h2 className="text-2xl font-semibold text-[#0B3D10] mb-4 mx-5">eID Applications Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mx-5">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md border-2 ${item.containerClass}`}
              >
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-md ${item.iconBgClass}`}
                >
                  <Icon className="w-5 h-5 xl:w-7 xl:h-7" />
                </div>
                <div className={`text-sm md:text-sm xl:text-lg font-semibold ${item.textClass}`}>
                  <span className="mr-1">{item.label}:</span>
                  <span>{item.value.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
