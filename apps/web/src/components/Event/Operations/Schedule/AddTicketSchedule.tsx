import type { ScheduleForm } from "@/firebase/interfaces/events";
import React, { useState } from "react";

import GradientButton from "@/components/Materials/GradientButton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addScheduleFunction } from "@/firebase/functions/events/addSchedule";

export default function AddTicketSchedule({ eventId }: { eventId: string }) {
  const [schedule, setSchedule] = useState<ScheduleForm>({
    name: "",
    description: "",
    type: "normal",
    ticketTotal: 0,
    id: uuidv4(),
    maxTicketPerBuy: 0,
    price: 0,
  });

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      await addScheduleFunction({ eventId: eventId, scheduleForm: schedule });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <GradientButton onClick={() => setOpen(true)} color={"info"}>
          Agregar entrada
        </GradientButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{"Agregar entrada"}</DialogTitle>
          <DialogDescription>
            Edita la entrada aquí y haz clic en Guardar cuando esté listo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input
              id="name"
              value={schedule.name}
              className="col-span-3"
              onChange={(e) =>
                setSchedule({
                  ...schedule,
                  name: e.target.value,
                })
              }
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={schedule.description}
              className="col-span-3"
              rows={4}
              onChange={(e) =>
                setSchedule({
                  ...schedule,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Tipo
            </Label>
            <Select
              defaultValue={schedule.type}
              onValueChange={(value) =>
                setSchedule({
                  ...schedule,
                  type: value,
                })
              }
            >
              <SelectTrigger className="w-[180px]" value={schedule.type}>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="double">Doble</SelectItem>
                <SelectItem value="unique">Único</SelectItem>
                <SelectItem value="private">Privado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ticketTotal" className="text-right">
              Precio
            </Label>
            <Input
              id="price"
              value={schedule.price}
              className="col-span-3"
              type="number"
              onChange={(e) =>
                setSchedule({
                  ...schedule,
                  price: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ticketTotal" className="text-right">
              Total de entradas
            </Label>
            <Input
              id="ticketTotal"
              value={schedule.ticketTotal}
              className="col-span-3"
              type="number"
              onChange={(e) =>
                setSchedule({
                  ...schedule,
                  ticketTotal: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ticketTotal" className="text-right">
              Máximo de entradas por compra
            </Label>
            <Input
              id="maxTicketPerBuy"
              value={schedule.maxTicketPerBuy}
              className="col-span-3"
              type="number"
              onChange={(e) =>
                setSchedule({
                  ...schedule,
                  maxTicketPerBuy: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <GradientButton
            color={"info"}
            onClick={() => {
              handleAction();
            }}
            loading={loading}
          >
            Agregar
          </GradientButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
