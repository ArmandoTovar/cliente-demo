"use client";

import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import SessionData from "./session-data";
import CustomLink from "./custom-link";

const UpdateForm = () => {
  const { data: session, update } = useSession();
  const [name, setName] = useState(`New ${session?.user?.name}` ?? "");
  if (!session?.user) return null;

  useEffect(() => {
    if (session) {
      localStorage.setItem("token", session?.accessToken as string);
    }
  }, []);
  return (
    <>
      <h2 className="text-xl font-bold">Updating the session</h2>
      <form
        onSubmit={async () => {
          if (session) {
            const newSession = await update({
              ...session,
              user: { ...session.user, name },
            });
            console.log({ newSession });
          }
        }}
        className="flex items-center space-x-2 w-full max-w-sm"
      >
        <Input
          type="text"
          placeholder="New name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <Button type="submit">Update</Button>
      </form>
    </>
  );
};

export default function ClientExample() {
  const { data: session, status } = useSession();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Client Side Rendering</h1>
      <p>
        This page fetches session data client side using the{" "}
        <CustomLink href="https://nextjs.authjs.dev/react#usesession">
          <code>useSession</code>
        </CustomLink>{" "}
        React Hook.
      </p>
      <p>
        It needs the{" "}
        <CustomLink href="https://react.devreference/nextjs/react/use-client">
          <code>'use client'</code>
        </CustomLink>{" "}
        directive at the top of the file to enable client side rendering, and
        the{" "}
        <CustomLink href="https://nextjs.authjs.dev/react#sessionprovider">
          <code>SessionProvider</code>
        </CustomLink>{" "}
        component in{" "}
        <strong>
          <code>client-example/page.tsx</code>
        </strong>{" "}
        to provide the session data.
      </p>

      {status === "loading" ? (
        <div>Loading...</div>
      ) : (
        <>
          <SessionData session={session} />
          <TodoApp />
        </>
      )}
      <UpdateForm />
    </div>
  );
}

const API_URL = "https://apim-external-aks-testnextarmando.azure-api.net/api";

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const response = await fetch(`${API_URL}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      setTodos(data);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTodo, completed: false }),
    });
    if (response.ok) {
      fetchTodos();
      setNewTodo("");
    }
  };

  const toggleComplete = async (id, completed) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ completed: !completed }),
    });
    if (response.ok) fetchTodos();
  };

  const deleteTodo = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) fetchTodos();
  };

  return (
    <div className="flex flex-col gap-4">
      <h4>Todo List</h4>
      <input
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && addTodo()}
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={addTodo}
        style={{ marginTop: 10 }}
      >
        Add Todo
      </button>
      <ul>
        {todos.map((todo: any) => (
          <li key={todo.id}>
            <a onClick={() => toggleComplete(todo.id, todo.completed)}></a>
            <span>{todo.title}</span>
            <span>{todo.completed ? "Completed" : "Pending"}</span>
            <button onClick={() => deleteTodo(todo.id)}>delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
