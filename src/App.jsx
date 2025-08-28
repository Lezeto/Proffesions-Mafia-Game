import React, { useState, useEffect, useRef } from "react";
import "./Game.css";
import deportistaImg from "./deportista.png";
import abogadoImg from "./abogado.png";
import empresarioImg from "./empresario.png";
import sacerdoteImg from "./sacerdote.png";
import policiaImg from "./policia.png";

import gemImg from "./gem.png";
import swordImg from "./sword.png";
import shieldImg from "./shield.png";
import helmetImg from "./helmet.png";
import armorImg from "./armor.png";
import legsImg from "./legs.png";
import bootsImg from "./boots.png";
import wandImg from "./wand.png";
import ringImg from "./ring.png";
import bookImg from "./book.png";


export default function Game() {

  const items = [
    { id: 1, name: "Gem", img: gemImg },
    { id: 2, name: "Sword", img: swordImg },
    { id: 3, name: "Shield", img: shieldImg },
    { id: 4, name: "Helmet", img: helmetImg },
    { id: 5, name: "Armor", img: armorImg },
    { id: 6, name: "Legs", img: legsImg },
    { id: 7, name: "Boots", img: bootsImg },
    { id: 8, name: "Wand", img: wandImg },
    { id: 9, name: "Ring", img: ringImg },
    { id: 10, name: "Book", img: bookImg },
  ];

  const itemImages = {
    Gem: gemImg,
    Sword: swordImg,
    Shield: shieldImg,
    Helmet: helmetImg,
    Armor: armorImg,
    Legs: legsImg,
    Boots: bootsImg,
    Wand: wandImg,
    Ring: ringImg,
    Book: bookImg,
  };
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
    { name: "Simple", req: 0, time: 2000, success: 0.9, damage: 20, exp: 20, lootChance: 0.9 },
    { name: "Normal", req: 5, time: 3000, success: 0.8, damage: 30, exp: 50, lootChance: 0.9 },
    { name: "Dificil", req: 10, time: 5000, success: 0.7, damage: 40, exp: 100, lootChance: 0.9 },
  ];

  const itemsPool = ["Helmet", "Armor", "Legs", "Boots", "Sword", "Shield", "Wand", "Ring", "Book", "Gem"];

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
  const [message, setMessage] = useState("");

  // Inventory & Equipment
  const [character, setCharacter] = useState({
    inventory: [],
    equipment: {
      Casco: null,
      Armadura: null,
      Pantalón: null,
      Botas: null,
      Izquierda: null,
      Derecha: null,
    },
  });
  const [draggedItem, setDraggedItem] = useState(null);

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

  // ---- Mission accept with loot system ----
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
            setPoints((p) => p + 5);
          }
          return tempExp;
        });

        // Loot drop
        if (Math.random() < mission.difficulty.lootChance) {
          const newItem = itemsPool[Math.floor(Math.random() * itemsPool.length)];
          setCharacter((prev) => ({
            ...prev,
            inventory: [...prev.inventory, newItem],
          }));
          showTempMessage(`¡Encontraste un ${newItem}!`);
        }

      } else {
        showTempMessage(`Fallaste la misión ${mission.name}`);
        setHp((h) => Math.max(0, h - mission.difficulty.damage));
      }
      setMissions((ms) => ms.filter((m) => m.id !== mission.id));
    }, mission.difficulty.time);
  };

  const cancelMission = (missionId) => setMissions((ms) => ms.filter((m) => m.id !== missionId));
  const upgradeStat = (stat) => { if (points > 0 && stats[stat] < MAX_STAT) { setStats((s) => ({ ...s, [stat]: s[stat] + 1 })); setPoints((p) => p - 1); } };

  // ---- Inventory & Equipment ----
  const isValidSlot = (item, slot) => {
    const validSlots = {
      Helmet: ["Casco"],
      Armor: ["Armadura"],
      Legs: ["Pantalón"],
      Boots: ["Botas"],
      Sword: ["Izquierda", "Derecha"],
      Shield: ["Izquierda", "Derecha"],
      Wand: ["Izquierda", "Derecha"],
      Ring: ["Izquierda", "Derecha"],
      Book: ["Izquierda", "Derecha"],
      Capa: ["Armadura"],
      Hat: ["Casco"],
    };
    return validSlots[item]?.includes(slot);
  };

  const equipItem = (item, slot) => {
    if (isValidSlot(item, slot)) {
      setCharacter((prev) => {
        const currentlyEquipped = prev.equipment[slot];
        const newInventory = [...prev.inventory];

        // Remove the new item from inventory
        const itemIndex = newInventory.indexOf(item);
        if (itemIndex > -1) {
          newInventory.splice(itemIndex, 1);
        }

        // If there's an item already equipped in this slot, add it to inventory
        if (currentlyEquipped) {
          newInventory.push(currentlyEquipped);
        }

        return {
          ...prev,
          equipment: { ...prev.equipment, [slot]: item },
          inventory: newInventory,
        };
      });
    }
  };

  const unequipItem = (slot) => {
    const item = character.equipment[slot];
    if (item) {
      setCharacter((prev) => ({
        ...prev,
        equipment: { ...prev.equipment, [slot]: null },
        inventory: [...prev.inventory, item],
      }));
    }
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
  };

  const handleDrop = (e, slot) => {
    e.preventDefault();
    if (!draggedItem || !isValidSlot(draggedItem, slot)) return;

    setCharacter((prev) => {
      const targetItem = prev.equipment[slot];
      const draggedItemSlot = Object.keys(prev.equipment).find(
        key => prev.equipment[key] === draggedItem
      );

      const newEquipment = { ...prev.equipment };
      const newInventory = [...prev.inventory];

      if (draggedItemSlot) {
        // Swap equipped items
        newEquipment[draggedItemSlot] = targetItem;
        newEquipment[slot] = draggedItem;
      } else {
        // From inventory to equipment
        const itemIndex = newInventory.indexOf(draggedItem);
        if (itemIndex > -1) newInventory.splice(itemIndex, 1);
        if (targetItem) newInventory.push(targetItem);
        newEquipment[slot] = draggedItem;
      }

      return { ...prev, equipment: newEquipment, inventory: newInventory };
    });

    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // ---- Render ----
  if (!profession) {
    return (
      <div className="game">
        <h1 className="titulo">Elige tu profesión</h1>
        <p className="descripcion">
          Bienvenido a la versión inicial de Profesión Mafia.
          Elige tu profesión favorita y sube de nivel para cometer crímenes más complejos.
          Puedes desarrollar distintas aptitudes: Fuerza, Coartada, Activos, Información o Patrullaje.
          Al comenzar, cada profesión tiene 10 puntos en una aptitud específica: el deportista en Fuerza, el abogado en Coartada, el empresario en Activos, el sacerdote en Información y el policía en Patrullaje.<br />
          Algunos crímenes requieren cierto nivel de aptitud, por lo que no podrás realizarlos todos desde el inicio.
          Los crímenes simples se pueden hacer de inmediato, mientras que otros exigen niveles mayores.
          Si no puedes realizar un crimen, puedes dejarlo para después o cancelarlo.<br />
          Puedes tener hasta 5 crímenes activos, y si te faltan, aparecerá uno nuevo cada 12 segundos.<br />
          Cada crimen tiene una probabilidad de éxito. Si lo completas, ganas experiencia; si fallas, pierdes vida.
          La vida se recupera gradualmente, 5 puntos cada 10 segundos.<br />
          Los crímenes más difíciles toman más tiempo, son más riesgosos y hacen perder más vida si fallan, pero dan más experiencia al tener éxito.<br />
          Al subir de nivel, obtienes 5 puntos para mejorar tus aptitudes a tu gusto.<br />
          El objetivo actual es alcanzar 10 en cada aptitud para poder realizar todos los crímenes que quieras. Se pierde si tu vida llega a 0.<br />
        </p>
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

      <div className="stats-and-inventory" style={{ display: "flex", gap: "20px" }}>
        <div className="stats">
          <div className="bar-container">
            <label>Vida:</label>
            <div className="bar-background">
              <div className="bar hp-bar" style={{ width: `${(hp / MAX_HP) * 100}%` }} />
            </div>
            <span>{hp}/{MAX_HP}</span>
          </div>

          <div className="bar-container">
            <label>Exp:</label>
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

        {/* Equipment + Inventory */}
        <div className="right-panel">
          <div className="equipment-section">
            <h2>Equipo</h2>
            <div className="equipment-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 80px)", gap: "5px" }}>
              {[
                null, "Casco", null,
                "Izquierda", "Armadura", "Derecha",
                null, "Pantalón", null,
                null, "Botas", null
              ].map((slot, index) => (
                slot ? (
                  <div
                    key={slot}
                    className={`equipment-slot ${slot}`}
                    onDrop={(e) => handleDrop(e, slot)}
                    onDragOver={handleDragOver}
                    onClick={() => {
                      if (character.equipment[slot]) {
                        unequipItem(slot);
                      }
                    }}
                    style={{ border: "1px solid #777", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  >
                    {character.equipment[slot] ? (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, character.equipment[slot])}
                      >
                        <img
                          src={items.find(i => i.name === character.equipment[slot]).img}
                          alt={character.equipment[slot]}
                          style={{ width: "64px", height: "64px", objectFit: "contain" }}
                        />
                      </div>
                    ) : (
                      <span>{slot}</span>
                    )}
                  </div>
                ) : (
                  <div key={`empty-${index}`} style={{ height: "80px" }}></div>
                )
              ))}
            </div>
          </div>
          <div className="inventory-section">
            <h2>Inventario</h2>
            <div className="inventory-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 60px)", gap: "5px" }}>
              {Array.from({ length: 20 }).map((_, index) => (
                <div key={index} className="inventory-slot" style={{ border: "1px solid #777", height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {character.inventory[index] && (
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, character.inventory[index])}
                    >
                      <img
                        src={itemImages[character.inventory[index]]}
                        alt={character.inventory[index]}
                        style={{ width: "48px", height: "48px", objectFit: "contain" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <h2>Crímenes</h2>
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
