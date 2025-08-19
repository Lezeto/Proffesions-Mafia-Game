import React, { useState, useEffect } from "react";
import "./Game.css";

export default function Game() {
  const professions = {
    Deportista: "fuerza",
    Abogado: "coartada",
    Empresario: "activos",
    Sacerdote: "informacion",
    Policia: "patrullaje",
  };

  const missionTypes = ["Robo", "Asesinato", "Redada", "Estafa", "Contrabando"];
  const difficulties = [
    { name: "Simple", req: 0, time: 10000, success: 0.9, damage: 20 },
    { name: "Normal", req: 5, time: 20000, success: 0.8, damage: 30 },
    { name: "Dificil", req: 10, time: 30000, success: 0.7, damage: 40 },
  ];

  const [profession, setProfession] = useState(null);
  const [stats, setStats] = useState({
    fuerza: 0,
    coartada: 0,
    activos: 0,
    informacion: 0,
    patrullaje: 0,
  });
  const [hp, setHp] = useState(100);
  const [level, setLevel] = useState(1);
  const [points, setPoints] = useState(0);
  const [missions, setMissions] = useState([]);
  const [cooldown, setCooldown] = useState(0);

  // Elegir profesión
  const chooseProfession = (prof) => {
    let newStats = { fuerza: 0, coartada: 0, activos: 0, informacion: 0, patrullaje: 0 };
    newStats[professions[prof]] = 10;
    setStats(newStats);
    setProfession(prof);
    generateMissions(5);
  };

  // Generar misiones
  const generateMissions = (n) => {
    let newMissions = [];
    for (let i = 0; i < n; i++) {
      const type = missionTypes[Math.floor(Math.random() * missionTypes.length)];
      const diff = difficulties[Math.floor(Math.random() * difficulties.length)];
      const statKeys = Object.keys(stats);
      const reqStat = statKeys[Math.floor(Math.random() * statKeys.length)];
      newMissions.push({
        id: Date.now() + Math.random(), // evitar IDs duplicados
        name: `${type} ${diff.name}`,
        difficulty: diff,
        reqStat: reqStat,
      });
    }
    setMissions((prev) => [...prev, ...newMissions]);
  };

  // Cooldown timer (disminuye cada 1s)
  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => {
        setCooldown((c) => Math.max(0, c - 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  // HP regen cada 10s si no hay cooldown
  useEffect(() => {
    const interval = setInterval(() => {
      if (cooldown === 0 && hp < 100) {
        setHp((h) => Math.min(100, h + 5));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [cooldown, hp]);

  // Generar misión nueva cada 5 minutos si hay menos de 5
  useEffect(() => {
    const interval = setInterval(() => {
      if (missions.length < 5) {
        generateMissions(1);
      }
    }, 300000); // 5 minutos
    return () => clearInterval(interval);
  }, [missions]); // depende de missions para verificar cantidad

  // Aceptar misión
  const acceptMission = (mission) => {
    if (cooldown > 0) return;
    if (stats[mission.reqStat] < mission.difficulty.req) {
      alert("No tienes suficientes stats para esta misión.");
      return;
    }

    setCooldown(mission.difficulty.time);

    setTimeout(() => {
      if (Math.random() <= mission.difficulty.success) {
        alert(`¡Éxito en la misión ${mission.name}!`);
        setLevel((lvl) => lvl + 1);
        setPoints((p) => p + 5);
      } else {
        alert(`Fallaste la misión ${mission.name}`);
        setHp((h) => Math.max(0, h - mission.difficulty.damage));
      }
      setMissions((ms) => ms.filter((m) => m.id !== mission.id));
    }, mission.difficulty.time);
  };

  // Cancelar misión
  const cancelMission = (missionId) => {
    setMissions((ms) => ms.filter((m) => m.id !== missionId));
  };

  // Asignar puntos
  const upgradeStat = (stat) => {
    if (points > 0) {
      setStats((s) => ({ ...s, [stat]: s[stat] + 1 }));
      setPoints((p) => p - 1);
    }
  };

  if (!profession) {
    return (
      <div className="game">
        <h1>Elige tu profesión</h1>
        <div className="professions">
          {Object.keys(professions).map((p) => (
            <button key={p} onClick={() => chooseProfession(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="game">
      <h1>{profession}</h1>
      <div className="stats">
        <p>HP: {hp}</p>
        <p>Nivel: {level}</p>
        <p>Puntos disponibles: {points}</p>
        {Object.keys(stats).map((s) => (
          <div key={s} className="stat">
            {s}: {stats[s]} <button onClick={() => upgradeStat(s)}>+</button>
          </div>
        ))}
      </div>

      <h2>Misiones</h2>
      <div className="missions">
        {missions.map((m) => (
          <div key={m.id} className="mission">
            <p>{m.name}</p>
            <p>Requiere: {m.difficulty.req} {m.reqStat}</p>
            <p>Prob. Éxito: {m.difficulty.success * 100}%</p>
            <p>Duración: {m.difficulty.time / 1000}s</p>
            <button disabled={cooldown > 0} onClick={() => acceptMission(m)}>
              Aceptar
            </button>
            <button onClick={() => cancelMission(m.id)}>
              Cancelar
            </button>
          </div>
        ))}
      </div>

      {/* Espacio fijo para cooldown */}
      <div className="cooldown-container">
        <p className="cooldown">
          Cooldown: {cooldown > 0 ? `${cooldown / 1000}s` : "0s"}
        </p>
      </div>
    </div>
  );
}
