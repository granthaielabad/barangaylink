import React from 'react';
import { FaAddressCard, FaUserAltSlash, FaUserCheck } from 'react-icons/fa';
import { FaClock } from 'react-icons/fa6';

export default function EidOverview({ stats }) {
  const {
    total = 0,
    active = 0,
    pending = 0,
    deactivated = 0,
  } = stats || {};

  const items = [
    {
      label: 'Total eIDs',
      value: total,
      icon: FaAddressCard,
      containerClass: 'bg-[#E6F4E6] border-[#B7DDB8]',
      iconBgClass: 'text-[#2F7A37]',
      textClass: 'text-[#005F02]',
    },
    {
      label: 'Active',
      value: active,
      icon: FaUserCheck,
      containerClass: 'bg-[#DDF3DD] border-[#7BC67D]',
      iconBgClass: 'text-[#2F7A37]',
      textClass: 'text-[#0A7A0C]',
    },
    {
      label: 'Pending',
      value: pending,
      icon: FaClock,
      containerClass: 'bg-[#FFF4D6] border-[#E6C36A]',
      iconBgClass: 'text-[#D9A441]',
      textClass: 'text-[#C58F00]',
    },
    {
      label: 'Deactivated',
      value: deactivated,
      icon: FaUserAltSlash,
      containerClass: 'bg-[#FDE8E7] border-[#E39A95]',
      iconBgClass: 'text-[#C43C3C]',
      textClass: 'text-[#B3261E]',
    },
  ];

  return (
    <section className="mb-6">
      <div className="bg-white rounded-2xl border border-[#CFE8CF] px-4 py-3">
        <h2 className="text-2xl font-semibold text-[#0B3D10] mb-4 mx-5">eID Overview</h2>
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
