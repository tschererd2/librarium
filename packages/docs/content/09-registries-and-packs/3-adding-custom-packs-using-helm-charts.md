---
title: "Adding a custom pack using helm charts"
metaTitle: "Adding a custom pack using helm charts"
metaDescription: "How to create custom made packs using Helm Charts and registries in Spectro Cloud"
icon: ""
hideToC: false
fullWidth: false
---

import WarningBox from '@librarium/shared/src/components/WarningBox';

# Add-on packs using helm charts

An add-on pack defines deployment specifics of a Kubernetes application to be installed on a running Kubernetes cluster. Spectro Cloud provides several add-on packs out-of-the-box for various layers of the Kubernetes stack. For example:

Logging  - elastic search, fluentd.

Monitoring -  Kubernetes dashboard, prometheus.

Load Balancers - Citrix.

Security  - Dex, Vault, Permissions manager.

Service Mesh - Istio.

Custom add-on packs can be built to extend the list of integrations.

The following example shows how to build the Prometheus-Grafana monitoring pack and push to a pack registry server using the Spectro Cloud CLI:

1. Create the pack directory named "prometheus-grafana".
2. Create the metadata file named `pack.json`.

```
{
    "addonType": "monitoring",
    "annotations": {
    },
    "ansibleRoles": [
    ],
    "cloudTypes": ["all"],
    "displayName": "Prometheus-Grafana",
    "eol": " ",
    "group": " ",
    "kubeManifests": [
    ],
    "charts": [
        "charts/prometheus-grafana.tgz"
    ],
    "layer":"addon",
    "name": "prometheus-grafana",
    "version": "9.7.2"
}
```

3. Download the desired version of the prometheus-grafana helm charts archive.
4. Create a sub-directory called `charts` and copy the downloaded helm chart archive to this directory.  Refer to the relative location of this archive in the pack manifest file, `pack.json` as shown in step 2.
5. Create a file called `values.yaml` for configurable chart parameters. This can be a subset of the `values.yaml` file shipped within the chart. Copy the entire file as is, if all chat parameters need to be made configurable. For the promethus-grafana pack, the `values.yaml` could look like this:-

```
pack:
  #The namespace (on the target cluster) to install this chart
  #When not found, a new namespace will be created
  namespace: "monitoring"

charts:
  prometheus-operator:

    # Default values for prometheus-operator.
    # This is a YAML-formatted file.
    # Declare variables to be passed into your templates.

    ## Provide a name in place of prometheus-operator for `app:` labels
    ##
    nameOverride: ""

    ## Provide a name to substitute for the full names of resources
    ##
    fullnameOverride: "prometheus-operator"

    ## Labels to apply to all resources
    ##
    commonLabels: {}
    # scmhash: abc123
    # myLabel: aakkmd

    ## Create default rules for monitoring the cluster
    ##
    defaultRules:
      create: true
      rules:
        alertmanager: true
        etcd: true
        general: true
        k8s: true
        kubeApiserver: true
        kubePrometheusNodeAlerting: true
        kubePrometheusNodeRecording: true
        kubernetesAbsent: true
        kubernetesApps: true
        kubernetesResources: true
        kubernetesStorage: true
        kubernetesSystem: true
        kubeScheduler: true
        network: true
        node: true
        prometheus: true
        prometheusOperator: true
        time: true

      ## Labels for default rules
      labels: {}
      ## Annotations for default rules
      annotations: {}

    ## Provide custom recording or alerting rules to be deployed into the cluster.
    ##
    additionalPrometheusRules: []
    #  - name: my-rule-file
    #    groups:
    #      - name: my_group
    #        rules:
    #        - record: my_record
    #          expr: 100 * my_record

    ##
    global:
      rbac:
        create: true
        pspEnabled: true

      ## Reference to one or more secrets to be used when pulling images
      ## ref: https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/
      ##
      imagePullSecrets: []
      # - name: "image-pull-secret"

    ## Configuration for alertmanager
    ## ref: https://prometheus.io/docs/alerting/alertmanager/
    ##
    alertmanager:

      ## Deploy alertmanager
      ##
      enabled: true

      ## Service account for Alertmanager to use.
      ## ref: https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/
      ##
      serviceAccount:
        create: true
        name: ""

      ## Configure pod disruption budgets for Alertmanager
      ## ref: https://kubernetes.io/docs/tasks/run-application/configure-pdb/#specifying-a-poddisruptionbudget
      ## This configuration is immutable once created and will require the PDB to be deleted to be changed
      ## https://github.com/kubernetes/kubernetes/issues/45398
      ##
      podDisruptionBudget:
        enabled: false
        minAvailable: 1
        maxUnavailable: ""

      ## Alertmanager configuration directives
      ## ref: https://prometheus.io/docs/alerting/configuration/#configuration-file
      ##      https://prometheus.io/webtools/alerting/routing-tree-editor/
      ##
      config:
        global:
          resolve_timeout: 5m
        route:
          group_by: ['job']
          group_wait: 30s
          group_interval: 5m
          repeat_interval: 12h
          receiver: 'null'
          routes:
            - match:
                alertname: Watchdog
              receiver: 'null'
        receivers:
          - name: 'null'

      ## Pass the Alertmanager configuration directives through Helm's templating
      ## engine. If the Alertmanager configuration contains Alertmanager templates,
      ## they'll need to be properly escaped so that they are not interpreted by
      ## Helm
      ## ref: https://helm.sh/docs/developing_charts/#using-the-tpl-function
      ##      https://prometheus.io/docs/alerting/configuration/#%3Ctmpl_string%3E
      ##      https://prometheus.io/docs/alerting/notifications/
      ##      https://prometheus.io/docs/alerting/notification_examples/
      tplConfig: false

      ## Alertmanager template files to format alerts
      ## ref: https://prometheus.io/docs/alerting/notifications/
      ##      https://prometheus.io/docs/alerting/notification_examples/
      ##
      templateFiles: {}
      #
      ## An example template:
      #   template_1.tmpl: |-
      #       {{ define "cluster" }}{{ .ExternalURL | reReplaceAll ".*alertmanager\\.(.*)" "$1" }}{{ end }}
      #
      #       {{ define "slack.myorg.text" }}
      #       {{- $root := . -}}
      #       {{ range .Alerts }}
      #         *Alert:* {{ .Annotations.summary }} - `{{ .Labels.severity }}`
      #         *Cluster:*  {{ template "cluster" $root }}
      #         *Description:* {{ .Annotations.description }}
      #         *Graph:* <{{ .GeneratorURL }}|:chart_with_upwards_trend:>
      #         *Runbook:* <{{ .Annotations.runbook }}|:spiral_note_pad:>
      #         *Details:*
      #           {{ range .Labels.SortedPairs }} • *{{ .Name }}:* `{{ .Value }}`
      #           {{ end }}

      ingress:
        enabled: false
 ...
```

6. Using Spectro CLI, push the newly built pack to the pack registry:

```
$spectro pack push prometheus-grafana --registry-server [REGISTRY-SERVER]
```