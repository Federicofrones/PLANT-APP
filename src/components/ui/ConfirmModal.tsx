"use client";

import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import Modal from "./Modal";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col items-center text-center space-y-6 pt-2">
                <div className="p-4 rounded-full bg-red-950/20 text-red-400 border border-red-500/10">
                    <AlertTriangle size={32} />
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed px-4">{message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full pt-4">
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-xl font-bold bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="w-full py-4 rounded-xl font-bold bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 size={18} /> Confirmar
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
