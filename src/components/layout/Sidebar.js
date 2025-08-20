'use client';
import Image from 'next/image';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="container">
      <div className="robot-face">
        <div className="robot-eyes">+ +</div>
        <div className="robot-mouth">—</div>
      </div>

      <div className="content">
        <div className="logo-group">
          <Image
            src="/cat.gif"
            alt=""
            className="logo-icon"
            width={30}
            height={30}
          />
          <h1 className="title">bucket</h1>
        </div>
      </div>
    </div>
  );
}
