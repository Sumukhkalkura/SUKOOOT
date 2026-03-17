import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Host({ back }) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [q, setQ] = useState("");
  const [o, setO] = useState(["", ""]);
  const [c, setC] = useState(0);
  const [room, setRoom] = useState("");
  const [s, setS] = useState(null);

  function save() {
    setQuestions([...questions, { text: q, options: o, correct: c }]);
    setQ("");
    setO(["", ""]);
    setC(0);
  }

  async function createQuiz() {
    const r = await axios.post("http://localhost:5001/api/createQuiz", {
      title,
      questions,
    });
    setRoom(r.data.room);
  }

  async function start() {
    await axios.post("http://localhost:5001/api/start", { room });
  }

  async function next() {
    const r = await axios.post("http://localhost:5001/api/next", { room });

    if (r.data?.end) {
      await axios.post("http://localhost:5001/api/end", { room });
    }
  }

  async function endQuiz() {
    await axios.post("http://localhost:5001/api/end", { room });
  }

  useEffect(() => {
    if (!room) return;

    const id = setInterval(async () => {
      const r = await axios.get("http://localhost:5001/api/status/" + room);
      setS(r.data);
    }, 1000);

    return () => clearInterval(id);
  }, [room]);

  return (
    <div>
      <button className="back-btn" onClick={back}>Back</button>

      {!room && (
        <>
          <h2>Create</h2>

          <input
            className="input"
            placeholder="Quiz title"
            onChange={(e) => setTitle(e.target.value)}
          />

          <h3>New Question</h3>

          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Question"
          />

          {o.map((v, i) => (
            <input
              key={i}
              className="input"
              value={v}
              onChange={(e) => {
                const t = [...o];
                t[i] = e.target.value;
                setO(t);
              }}
              placeholder={`Option ${i + 1}`}
            />
          ))}

          <button className="btn" onClick={() => setO([...o, ""])}>Add option</button>

          <h4>Correct Index</h4>

          <input
            className="input"
            type="number"
            value={c}
            onChange={(e) => setC(Number(e.target.value))}
          />

          <button className="btn" onClick={save}>Save Q</button>
          <button className="btn" onClick={createQuiz}>Create Room</button>
        </>
      )}

      {room && !s?.ended && (
        <>
          <div className="room-box">
            <h3>Room Code</h3>
            <div className="room-code">{room}</div>
          </div>

          <h2>Room {room}</h2>

          <button className="btn" onClick={start} disabled={s?.started}>
            Start
          </button>

          <button className="btn" onClick={next} disabled={!s?.started}>
            Next
          </button>

          {s?.started && !s?.ended && (
            <button className="btn end-btn" onClick={endQuiz}>
              End Quiz
            </button>
          )}

          {s?.started && !s?.ended && s.currentIndex >= 0 && (
            <div className="host-question-view">
              <h3>Current Question</h3>

              <div className="room-box">
                <strong>{s.questions[s.currentIndex].text}</strong>

                <div style={{ marginTop: "10px", textAlign: "left" }}>
                  {s.questions[s.currentIndex].options.map((op, i) => (
                    <div key={i} style={{ marginBottom: "4px" }}>
                      {i + 1}. {op}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {s && !s?.ended && (
            <>
              <h3>Players:</h3>
              {s.players?.map((p) => (
                <div key={p.name}>
                  {p.name}: {p.score}
                </div>
              ))}
            </>
          )}
        </>
      )}

      {s?.ended && s?.leaderboard && (
        <>
          <h2>Quiz Completed</h2>

          <h2>FINAL LEADERBOARD</h2>
          <div className="room-box">
            {s.leaderboard.map((x) => (
              <div key={x.rank}>
                #{x.rank} — {x.name} — {x.score} pts
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}