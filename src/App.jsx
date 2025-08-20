import React, { useState, useEffect, useRef } from "react";
import "./Game.css";
import deportistaImg from "./deportista.png";
import abogadoImg from "./abogado.png";
import empresarioImg from "./empresario.png";
import sacerdoteImg from "./sacerdote.png";
import policiaImg from "./policia.png";

export default function Game() {
  const professions = {
    Deportista: "fuerza",
    Abogado: "coartada",
    Empresario: "activos",
    Sacerdote: "informacion",
    Policia: "patrullaje",
  };

  const professionImages = {
    Deportista: deportistaImg,
    Abogado: abogadoImg,
    Empresario: empresarioImg,
    Sacerdote: sacerdoteImg,
    Policia: policiaImg,
  };

  const missionTypes = ["Robo", "Asesinato", "Redada", "Estafa", "Contrabando"];
  const difficulties = [
    { name: "Simple", req: 0, time: 5000, success: 0.9, damage: 20, exp: 20 },
    { name: "Normal", req: 5, time: 8000, success: 0.8, damage: 30, exp: 50 },
    { name: "Dificil", req: 10, time: 10000, success: 0.7, damage: 40, exp: 100 },
  ];

  const MAX_STAT = 30;
  const MAX_HP = 100;

  const [profession, setProfession] = useState(null);
  const [stats, setStats] = useState({
    fuerza: 0,
    coartada: 0,
    activos: 0,
    informacion: 0,
    patrullaje: 0,
  });
  const [hp, setHp] = useState(MAX_HP);
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [points, setPoints] = useState(0);
  const [missions, setMissions] = useState([]);
  const [cooldown, setCooldown] = useState(0);
  const [nextMissionIn, setNextMissionIn] = useState(12);
  const [missionFull, setMissionFull] = useState(true);
  const [message, setMessage] = useState("");
  const [a, setA] = useState(1);

  const expToNextLevel = (lvl) => {
    if (lvl === 1) return 100;
    return Math.floor(expToNextLevel(lvl - 1) * 1.6);
  };

  const chooseProfession = (prof) => {
    let newStats = { fuerza: 0, coartada: 0, activos: 0, informacion: 0, patrullaje: 0 };
    newStats[professions[prof]] = 10;
    setStats(newStats);
    setProfession(prof);
    setMissions([]);
    generateMissions(5, newStats);
  };

  const generateMissions = (n, currentStats = stats) => {
    let newMissions = [];
    for (let i = 0; i < n; i++) {
      const type = missionTypes[Math.floor(Math.random() * missionTypes.length)];
      const diff = difficulties[Math.floor(Math.random() * difficulties.length)];
      const statKeys = Object.keys(currentStats);
      const reqStat = statKeys[Math.floor(Math.random() * statKeys.length)];
      newMissions.push({ id: Date.now() + Math.random(), name: `${type} ${diff.name}`, difficulty: diff, reqStat });
    }
    setMissions((prev) => [...prev, ...newMissions]);
  };

  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => {
        setCooldown((c) => Math.max(0, c - 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (cooldown === 0 && hp < MAX_HP) setHp((h) => Math.min(MAX_HP, h + 5));
    }, 10000);
    return () => clearInterval(interval);
  }, [cooldown, hp]);

  const countdownInterval = useRef(null);
  const [tickCounter, setTickCounter] = useState(0);

  useEffect(() => {
    if (!profession) return;
    if (missions.length >= 5) return;
    const interval = setInterval(() => {
      setTickCounter((t) => {
        if (t >= 9) {
          setNextMissionIn((n) => {
            if (n <= 1) {
              setMissions((prev) => {
                if (prev.length < 5) generateMissions(1);
                return prev;
              });
              return 12;
            }
            return n - 1;
          });
          return 0;
        }
        return t + 1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [missions.length]);

  const showTempMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 7000);
  };

  const acceptMission = (mission) => {
    if (cooldown > 0) return;
    if (stats[mission.reqStat] < mission.difficulty.req) {
      showTempMessage("No tienes suficientes stats para esta misión.");
      return;
    }
    setCooldown(mission.difficulty.time);
    setTimeout(() => {
      if (Math.random() <= mission.difficulty.success) {
        showTempMessage(`¡Éxito en la misión ${mission.name}!`);
        setExp((currentExp) => {
          let newExp = currentExp + mission.difficulty.exp;
          let newLevel = level;
          let tempExp = newExp;
          while (tempExp >= expToNextLevel(newLevel)) {
            tempExp -= expToNextLevel(newLevel);
            newLevel += 1;
            setLevel(newLevel);
            setPoints((p) => p + 2.5);
          }
          return tempExp;
        });
      } else {
        showTempMessage(`Fallaste la misión ${mission.name}`);
        setHp((h) => Math.max(0, h - mission.difficulty.damage));
      }
      setMissions((ms) => ms.filter((m) => m.id !== mission.id));
    }, mission.difficulty.time);
  };

  const cancelMission = (missionId) => setMissions((ms) => ms.filter((m) => m.id !== missionId));
  const upgradeStat = (stat) => { if (points > 0 && stats[stat] < MAX_STAT) { setStats((s) => ({ ...s, [stat]: s[stat] + 1 })); setPoints((p) => p - 1); } };

  if (!profession) {
    return (
      <div className="game">
        <h1 className="titulo">Elige tu profesión</h1>
        <div className="professions">
          {Object.keys(professions).map((p) => (
            <div key={p} className="profession-choice" onClick={() => chooseProfession(p)}>
              <img src={professionImages[p]} alt={p} />
              <span>{p}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="game">
      <h1>
        <img src={professionImages[profession]} className="profession-icon" alt={profession} />
        {profession}
      </h1>

      <div className="stats">
        <div className="bar-container">
          <label>HP:</label>
          <div className="bar-background">
            <div className="bar hp-bar" style={{ width: `${(hp / MAX_HP) * 100}%` }} />
          </div>
          <span>{hp}/{MAX_HP}</span>
        </div>

        <div className="bar-container">
          <label>EXP:</label>
          <div className="bar-background">
            <div className="bar exp-bar" style={{ width: `${(exp / expToNextLevel(level)) * 100}%` }} />
          </div>
          <span>{exp}/{expToNextLevel(level)}</span>
        </div>

        <p>Nivel: {level}</p>
        <p>Puntos disponibles: {points}</p>

        {Object.keys(stats).map((s) => (
          <div key={s} className="bar-container">
            <label>{s}:</label>
            <div className="bar-background">
              <div className="bar stat-bar" style={{ width: `${(stats[s] / MAX_STAT) * 100}%` }} />
            </div>
            <span>{stats[s]}/{MAX_STAT}</span>
            <button onClick={() => upgradeStat(s)}>+</button>
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
            <p>Exp: {m.difficulty.exp}</p>
            <button disabled={cooldown > 0} onClick={() => acceptMission(m)}>Aceptar</button>
            <button onClick={() => cancelMission(m.id)}>Cancelar</button>
          </div>
        ))}
      </div>

      <div className="cooldown-container">
        <p className="cooldown">Cooldown: {cooldown > 0 ? `${cooldown / 1000}s` : "0s"}</p>
        {missions.length < 5 && nextMissionIn > 0 && <p className="next-mission">Siguiente misión en: {Math.floor(nextMissionIn / 60)}m {nextMissionIn % 60}s</p>}
        {message && <p className="mission-message">{message}</p>}
      </div>
    </div>
  );
}
