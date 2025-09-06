'use client';
import Image from 'next/image';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="robot-face">
        <div className="robot-eyes">+ +</div>
        <div className="robot-mouth">—</div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-logo-group">
          <Image
            src="/cat.gif"
            alt=""
            className="logo-icon"
            width={30}
            height={30}
          />
          <h1 className="dashboard-title">bucket</h1>
        </div>
      </div>
    </div>
  );
}
