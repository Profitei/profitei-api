#!/bin/bash

NAMESPACE="kong"

# Busca o nome do pod do Kong
POD_NAME=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/component=app -o jsonpath="{.items[0].metadata.name}")

if [ -z "$POD_NAME" ]; then
  echo "❌ Não foi possível encontrar o pod do Kong no namespace '$NAMESPACE'."
  exit 1
fi

echo "✅ Encontrado pod do Kong: $POD_NAME"

# Checa se tmux está instalado
if command -v tmux &> /dev/null; then
  echo "🔄 Iniciando port-forward com tmux..."

  tmux new-session -d -s kong_pf "kubectl port-forward -n $NAMESPACE pod/$POD_NAME 8001:8001 8444:8444"
  tmux split-window -h "kubectl port-forward -n $NAMESPACE pod/$POD_NAME 8002:8002 8445:8445"
  tmux select-layout even-horizontal
  tmux attach-session -t kong_pf

else
  echo "⚠️ tmux não encontrado. Iniciando em dois processos em background..."

  kubectl port-forward -n $NAMESPACE pod/$POD_NAME 8001:8001 8444:8444 &
  PID1=$!
  echo "🔁 Admin API forward rodando com PID $PID1"

  kubectl port-forward -n $NAMESPACE pod/$POD_NAME 8002:8002 8445:8445 &
  PID2=$!
  echo "🔁 Manager forward rodando com PID $PID2"

  echo "✅ Pressione Ctrl+C para encerrar os port-forwards."
  wait $PID1 $PID2
fi
