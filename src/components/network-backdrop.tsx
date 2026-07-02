const nodes = [
  [90, 170], [300, 92], [480, 212], [690, 110], [910, 224], [1120, 132],
  [160, 590], [340, 430], [548, 552], [770, 390], [1030, 520],
];

export function NetworkBackdrop() {
  return (
    <div className="network-backdrop" aria-hidden="true">
      <div className="network-grid" />
      <div className="network-orb network-orb-a" />
      <div className="network-orb network-orb-b" />
      <svg className="network-map" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice">
        <path d="M90 170 300 92 480 212 690 110 910 224 1120 132" />
        <path d="M160 590 340 430 548 552 770 390 1030 520" />
        <path d="M300 92 340 430M480 212 548 552M690 110 770 390M910 224 1030 520" />
        {nodes.map(([cx, cy], index) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={index % 3 === 0 ? 5 : 3} />)}
      </svg>
    </div>
  );
}
